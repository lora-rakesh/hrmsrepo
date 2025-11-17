import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { leaveApi } from '../../services/api';
import { LeaveRequest } from '../../types/api';
import { useAuth } from '../../contexts/AuthContext';
import { CheckIcon, XMarkIcon, EyeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function LeaveApproval() {
  const { user } = useAuth();
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const canApprove = user?.role === 'SUPER_ADMIN' || user?.role === 'HR_MANAGER' || user?.role === 'TEAM_LEAD';

  useEffect(() => {
    if (canApprove) {
      loadPendingLeaves();
    }
  }, [canApprove]);

  const loadPendingLeaves = async () => {
    try {
      setIsLoading(true);
      const response = await leaveApi.getPendingRequests();
      setPendingLeaves(response);
    } catch (error) {
      console.error('Error loading pending leaves:', error);
      toast.error('Failed to load pending leave requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (leaveId: string) => {
    setIsProcessing(true);
    try {
      await leaveApi.approveRequest(leaveId);
      toast.success('Leave request approved successfully!');
      loadPendingLeaves();
    } catch (error: any) {
      console.error('Error approving leave:', error);
      toast.error(error.response?.data?.error || 'Failed to approve leave request');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedLeave || !rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setIsProcessing(true);
    try {
      await leaveApi.rejectRequest(selectedLeave.id, rejectionReason);
      toast.success('Leave request rejected');
      setShowRejectModal(false);
      setSelectedLeave(null);
      setRejectionReason('');
      loadPendingLeaves();
    } catch (error: any) {
      console.error('Error rejecting leave:', error);
      toast.error(error.response?.data?.error || 'Failed to reject leave request');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  if (!canApprove) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to approve leave requests.</p>
        </div>
      </Layout>
    );
  }

  const columns = [
    {
      key: 'employee_name',
      header: 'Employee',
      render: (value: string) => (
        <div className="text-sm font-medium text-gray-900">{value}</div>
      ),
    },
    {
      key: 'leave_type_name',
      header: 'Leave Type',
    },
    {
      key: 'start_date',
      header: 'Start Date',
      render: (value: string) => formatDate(value),
    },
    {
      key: 'end_date',
      header: 'End Date',
      render: (value: string) => formatDate(value),
    },
    {
      key: 'days_requested',
      header: 'Days',
      render: (value: string) => `${value} day(s)`,
    },
    {
      key: 'applied_date',
      header: 'Applied On',
      render: (value: string) => formatDate(value),
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (value: string) => (
        <div className="text-sm text-gray-900 max-w-xs truncate" title={value}>
          {value}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, row: LeaveRequest) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleApprove(row.id)}
            disabled={isProcessing}
            className="text-green-600 hover:text-green-900 disabled:opacity-50"
            title="Approve"
          >
            <CheckIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setSelectedLeave(row);
              setShowRejectModal(true);
            }}
            disabled={isProcessing}
            className="text-red-600 hover:text-red-900 disabled:opacity-50"
            title="Reject"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setSelectedLeave(row)}
            className="text-indigo-600 hover:text-indigo-900"
            title="View Details"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <Layout>
       <div className="min-h-screen bg-gray-50 pt-4 pb-10">
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Approvals</h1>
          <p className="text-sm text-gray-600">{pendingLeaves.length} pending requests</p>
        </div>

        {/* Pending Requests Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Pending Leave Requests</h3>
          </div>
          <Table
            columns={columns}
            data={pendingLeaves}
            isLoading={isLoading}
            emptyMessage="No pending leave requests"
          />
        </div>

        {/* Leave Details Modal */}
        {selectedLeave && !showRejectModal && (
          <Modal
            isOpen={!!selectedLeave}
            onClose={() => setSelectedLeave(null)}
            title="Leave Request Details"
            size="lg"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Employee</label>
                  <p className="text-sm text-gray-900">{selectedLeave.employee_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Leave Type</label>
                  <p className="text-sm text-gray-900">{selectedLeave.leave_type_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Start Date</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedLeave.start_date)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">End Date</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedLeave.end_date)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Total Days</label>
                  <p className="text-sm text-gray-900">{selectedLeave.days_requested} days</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Applied On</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedLeave.applied_date)}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Reason</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{selectedLeave.reason}</p>
              </div>

              {selectedLeave.handover_to_name && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Handover To</label>
                  <p className="text-sm text-gray-900">{selectedLeave.handover_to_name}</p>
                  {selectedLeave.handover_notes && (
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-500 mb-1">Handover Notes</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{selectedLeave.handover_notes}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => setSelectedLeave(null)}
                >
                  Close
                </Button>
                <Button
                  variant="danger"
                  onClick={() => setShowRejectModal(true)}
                  disabled={isProcessing}
                >
                  Reject
                </Button>
                <Button
                  onClick={() => handleApprove(selectedLeave.id)}
                  disabled={isProcessing}
                  isLoading={isProcessing}
                >
                  Approve
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Rejection Modal */}
        <Modal
          isOpen={showRejectModal}
          onClose={() => {
            setShowRejectModal(false);
            setRejectionReason('');
          }}
          title="Reject Leave Request"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Please provide a reason for rejecting this leave request.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                placeholder="Please explain why this leave request is being rejected..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleReject}
                disabled={!rejectionReason.trim() || isProcessing}
                isLoading={isProcessing}
              >
                Reject Request
              </Button>
            </div>
          </div>
        </Modal>
      </div>
      </div>
      </div>
    </Layout>
  );
}