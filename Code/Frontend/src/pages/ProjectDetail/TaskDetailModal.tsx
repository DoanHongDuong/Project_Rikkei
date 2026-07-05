import { Modal, Typography, Avatar, Space, Button, Divider, List, Input, Skeleton, Tag, Tabs, Timeline, Empty, message } from 'antd';
import { LeftOutlined, UserOutlined, DeleteOutlined, EditOutlined, SendOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import TaskService from '../../services/taskService';
import CommentService from '../../services/commentService';
import AuthService from '../../services/authService';
import ExtensionService from '../../services/extensionService';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface TaskDetailModalProps {
  open: boolean;
  onCancel: () => void;
  taskId: string | number;
  onEditClick: () => void;
  onDeleteSuccess?: () => void;
  isMember?: boolean;
  highlightCommentId?: string | null;
  highlightExtension?: boolean;
}

export default function TaskDetailModal({ open, onCancel, taskId, onEditClick, onDeleteSuccess, isMember, highlightCommentId, highlightExtension }: TaskDetailModalProps) {
  const [newComment, setNewComment] = useState('');
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [highlightedComment, setHighlightedComment] = useState<string | number | null>(null);

  // Extension Request States
  const [isExtensionModalVisible, setIsExtensionModalVisible] = useState(false);
  const [requestedDeadline, setRequestedDeadline] = useState('');
  const [extensionReason, setExtensionReason] = useState('');
  const [submittingExtension, setSubmittingExtension] = useState(false);
  const [pendingRequest, setPendingRequest] = useState<any>(null);

  // Extension Review States (PM/ADMIN)
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [reviewAction, setReviewAction] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const currentUser = AuthService.getUser();

  useEffect(() => {
    if (open && taskId) {
      loadTask();
    }
  }, [open, taskId]);

  const highlightComment = (commentId: string | number) => {
    setTimeout(() => {
      const el = document.getElementById(`comment-${commentId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setHighlightedComment(commentId);
        setTimeout(() => {
          setHighlightedComment(null);
        }, 2000);
      }
    }, 600);
  };

  useEffect(() => {
    if (!loading && comments.length > 0 && highlightCommentId) {
      highlightComment(highlightCommentId);
    }
  }, [loading, comments, highlightCommentId]);

  useEffect(() => {
    const handleReHighlight = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        highlightComment(customEvent.detail);
      }
    };
    window.addEventListener('reHighlightComment', handleReHighlight);
    return () => {
      window.removeEventListener('reHighlightComment', handleReHighlight);
    };
  }, []);

  const highlightExtensionFrame = () => {
    setTimeout(() => {
      const el = document.getElementById('extension-request-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.transition = 'background-color 1s ease-out';
        el.style.backgroundColor = '#ffd591';
        setTimeout(() => {
          el.style.backgroundColor = '#fffbe6';
        }, 2000);
      }
    }, 600);
  };

  useEffect(() => {
    if (!loading && pendingRequest && highlightExtension) {
      highlightExtensionFrame();
    }
  }, [loading, pendingRequest, highlightExtension]);

  useEffect(() => {
    const handleReHighlightExt = () => {
      if (pendingRequest) {
        highlightExtensionFrame();
      }
    };
    window.addEventListener('reHighlightExtension', handleReHighlightExt);
    return () => {
      window.removeEventListener('reHighlightExtension', handleReHighlightExt);
    };
  }, [pendingRequest]);

  const loadTask = async () => {
    try {
      setLoading(true);
      const [data, commentsData] = await Promise.all([
        TaskService.getTaskDetail(taskId),
        CommentService.getCommentsByTask(taskId)
      ]);
      setTask(data);
      setComments(commentsData);

      // Load pending extension request for this task
      const user = AuthService.getUser();
      if (user) {
        if (user.role === 'MEMBER') {
          const myRequests = await ExtensionService.getMyRequests();
          const pending = myRequests.find((r: any) => Number(r.task_id) === Number(taskId) && r.status === 'PENDING');
          setPendingRequest(pending || null);
        } else if (user.role === 'PM' || user.role === 'ADMIN') {
          const pendingRequests = await ExtensionService.getPendingRequests();
          const pending = pendingRequests.find((r: any) => Number(r.task_id) === Number(taskId));
          setPendingRequest(pending || null);
        }
      } else {
        setPendingRequest(null);
      }
    } catch (error: any) {
      console.error('Lỗi tải task:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestExtension = async () => {
    if (!requestedDeadline) {
      message.error('Vui lòng chọn deadline mới');
      return;
    }
    if (!extensionReason.trim()) {
      message.error('Vui lòng nhập lý do gia hạn');
      return;
    }

    if (dayjs(requestedDeadline).isBefore(dayjs(task.deadline)) || dayjs(requestedDeadline).isSame(dayjs(task.deadline))) {
      message.error('Deadline mới phải sau deadline hiện tại');
      return;
    }

    if (task.project) {
      if (task.project.start_date && dayjs(requestedDeadline).isBefore(dayjs(task.project.start_date))) {
        message.error(`Deadline mới không được trước ngày bắt đầu của dự án (${dayjs(task.project.start_date).format('DD/MM/YYYY')})`);
        return;
      }
      if (task.project.end_date && dayjs(requestedDeadline).isAfter(dayjs(task.project.end_date))) {
        message.error(`Deadline mới không được vượt quá ngày kết thúc của dự án (${dayjs(task.project.end_date).format('DD/MM/YYYY')})`);
        return;
      }
    }

    try {
      setSubmittingExtension(true);
      await ExtensionService.createRequest({
        taskId: task.id,
        requestedDeadline,
        reason: extensionReason
      });
      message.success('Đã gửi yêu cầu gia hạn deadline thành công');
      setIsExtensionModalVisible(false);
      setRequestedDeadline('');
      setExtensionReason('');
      loadTask();
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi gửi yêu cầu gia hạn');
    } finally {
      setSubmittingExtension(false);
    }
  };

  const handleOpenReviewModal = (action: 'APPROVED' | 'REJECTED') => {
    setReviewAction(action);
    setIsReviewModalVisible(true);
  };

  const handleConfirmReview = async () => {
    if (!pendingRequest) return;
    try {
      setSubmittingReview(true);
      if (reviewAction === 'APPROVED') {
        await ExtensionService.approveRequest(pendingRequest.id, reviewNote);
        message.success('Đã phê duyệt yêu cầu gia hạn');
      } else {
        await ExtensionService.rejectRequest(pendingRequest.id, reviewNote);
        message.success('Đã từ chối yêu cầu gia hạn');
      }
      setIsReviewModalVisible(false);
      setReviewNote('');
      setReviewAction(null);
      setPendingRequest(null);
      loadTask();
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi xử lý yêu cầu');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    try {
      setSubmitting(true);
      const addedComment = await CommentService.createComment(taskId, newComment, replyingTo?.id);
      setComments([...comments, addedComment]);
      setNewComment('');
      setReplyingTo(null);
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await CommentService.deleteComment(commentId);
      setComments(comments.filter(c => c.id !== commentId));
      message.success('Đã xóa bình luận');
    } catch (error: any) {
      message.error(error.message);
    }
  };

  const priorityColor: Record<string, string> = {
    LOW: 'green',
    MEDIUM: 'blue',
    HIGH: 'orange',
    URGENT: 'red',
  };

  const statusColor: Record<string, string> = {
    TODO: 'default',
    IN_PROGRESS: 'processing',
    DONE: 'success',
  };

  const statusLabel: Record<string, string> = {
    TODO: 'Cần làm',
    IN_PROGRESS: 'Đang làm',
    REVIEW: 'Chờ review',
    BLOCKED: 'Bị chặn',
    DONE: 'Hoàn thành',
    CANCELED: 'Đã hủy',
  };

  const fieldLabel: Record<string, string> = {
    status: 'trạng thái',
    assignee_id: 'người thực hiện',
    priority: 'độ ưu tiên',
    deadline: 'hạn chót',
  };

  const formatHistoryValue = (fieldName: string, value: string) => {
    if (fieldName === 'status') {
      return statusLabel[value] || value;
    }
    return value;
  };

  const renderHistoryLabel = (entry: any) => {
    const actor = entry.updatedBy?.full_name || entry.updatedBy?.email || 'Ai đó';
    const field = fieldLabel[entry.field_name] || entry.field_name || 'thông tin';

    if (entry.old_value && entry.new_value) {
      return `${actor} đổi ${field}: "${formatHistoryValue(entry.field_name, entry.old_value)}" → "${formatHistoryValue(entry.field_name, entry.new_value)}"`;
    }
    return `${actor} cập nhật ${field}${entry.note ? `: ${entry.note}` : ''}`;
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={700}
      className="task-detail-modal"
      closeIcon={null}
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Button
            type="text"
            icon={<LeftOutlined />}
            onClick={onCancel}
            style={{ fontSize: 16, fontWeight: 500, paddingLeft: 0 }}
          >
            Trở về <span style={{ marginLeft: 8 }}>Chi tiết công việc</span>
          </Button>
          <Space>
            {isMember && task && currentUser && Number(task.assignee_id) === Number(currentUser.id) && !pendingRequest && (
              <Button type="primary" onClick={() => setIsExtensionModalVisible(true)}>
                Yêu cầu gia hạn
              </Button>
            )}
            {!isMember && <Button icon={<EditOutlined />} onClick={onEditClick}>Sửa task</Button>}
            {!isMember && (
              <Button 
                danger 
                icon={<DeleteOutlined />} 
                onClick={() => {
                  Modal.confirm({
                    title: 'Xóa công việc',
                    content: 'Bạn có chắc chắn muốn xóa công việc này không?',
                    okText: 'Xóa',
                    okType: 'danger',
                    cancelText: 'Hủy',
                    onOk: async () => {
                      try {
                        await TaskService.deleteTask(taskId);
                        message.success('Đã xóa công việc thành công');
                        if (onDeleteSuccess) onDeleteSuccess();
                      } catch (error: any) {
                        message.error(error.message || 'Lỗi khi xóa công việc');
                      }
                    }
                  });
                }}
              >
                Xóa việc
              </Button>
            )}
          </Space>
        </div>
      }
    >
      <div style={{ marginTop: 24 }}>
        {loading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : task ? (
          <Tabs
            defaultActiveKey="detail"
            items={[
              {
                key: 'detail',
                label: 'Chi tiết',
                children: (
                  <>
                    <Title level={3}>{task.title}</Title>

                    <Space style={{ marginBottom: 16 }}>
                      <Tag color={statusColor[task.status] || 'default'}>{task.status?.replace('_', ' ')}</Tag>
                      <Tag color={priorityColor[task.priority] || 'default'}>{task.priority}</Tag>
                    </Space>

                    <Title level={5} style={{ marginTop: 16, marginBottom: 8 }}>Mô tả</Title>
                    <Paragraph type="secondary" style={{ fontSize: 14 }}>
                      {task.description || 'Không có mô tả'}
                    </Paragraph>

                     <Title level={5} style={{ marginTop: 24, marginBottom: 8 }}>Hạn chót</Title>
                    <Text style={{ display: 'block', marginBottom: 8 }}>{task.deadline ? dayjs(task.deadline).format('DD/MM/YYYY') : 'Chưa đặt'}</Text>

                    {pendingRequest && (
                      <div id="extension-request-section" style={{ marginTop: 16, padding: 16, border: '1px solid #ffe58f', backgroundColor: '#fffbe6', borderRadius: 8 }}>
                        <Title level={5} style={{ margin: 0, color: '#d46b08', fontSize: 14 }}>
                          Yêu cầu gia hạn đang chờ duyệt
                        </Title>
                        <div style={{ marginTop: 8 }}>
                          <div><Text strong>Hạn chót mới:</Text> <Text>{dayjs(pendingRequest.requested_deadline).format('DD/MM/YYYY')}</Text></div>
                          <div style={{ marginTop: 4 }}><Text strong>Lý do:</Text> <Text>{pendingRequest.reason}</Text></div>
                          {pendingRequest.requester && (
                            <div style={{ marginTop: 4 }}>
                              <Text strong>Người yêu cầu:</Text> <Text>{pendingRequest.requester.full_name || pendingRequest.requester.email}</Text>
                            </div>
                          )}
                        </div>

                        {/* Nút Phê duyệt / Từ chối dành cho PM/ADMIN */}
                        {(currentUser?.role === 'PM' || currentUser?.role === 'ADMIN') && (
                          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                            <Button type="primary" size="small" onClick={() => handleOpenReviewModal('APPROVED')}>
                              Phê duyệt
                            </Button>
                            <Button danger size="small" onClick={() => handleOpenReviewModal('REJECTED')}>
                              Từ chối
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    <Title level={5} style={{ marginTop: 24, marginBottom: 8 }}>Người thực hiện</Title>
                    {task.assignee ? (
                      <Space>
                        <Avatar icon={<UserOutlined />} />
                        <Text>{task.assignee.full_name || task.assignee.email}</Text>
                      </Space>
                    ) : (
                      <Text type="secondary">Chưa được phân công</Text>
                    )}

                    <Title level={5} style={{ marginTop: 24, marginBottom: 8 }}>Người tạo</Title>
                    {task.creator && (
                      <Space>
                        <Avatar icon={<UserOutlined />} />
                        <Text>{task.creator.full_name || task.creator.email}</Text>
                      </Space>
                    )}

                    <Divider style={{ margin: '24px 0' }} />

                    <Title level={5} style={{ marginBottom: 16 }}>Bình luận</Title>
                    {comments.length === 0 ? (
                      <Empty description="Chưa có bình luận" />
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {comments.filter(c => !c.parent_comment_id).map(comment => (
                          <div key={comment.id} id={`comment-${comment.id}`} style={{ padding: 8, borderRadius: 8, backgroundColor: highlightedComment == comment.id ? '#fffbe6' : 'transparent', transition: 'background-color 1s ease-out' }}>
                            <div style={{ display: 'flex', gap: 12 }}>
                              <Avatar icon={<UserOutlined />} />
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Space>
                                    <Text strong>{comment.user?.full_name || comment.user?.email}</Text>
                                    <Text type="secondary" style={{ fontSize: 12 }}>{dayjs(comment.created_at).format('DD/MM/YYYY HH:mm')}</Text>
                                  </Space>
                                  <Space>
                                    <Button type="link" size="small" onClick={() => setReplyingTo(comment)}>Phản hồi</Button>
                                    {(currentUser?.role === 'ADMIN' || currentUser?.id === comment.user_id) && (
                                      <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => handleDeleteComment(comment.id)} />
                                    )}
                                  </Space>
                                </div>
                                <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>{comment.content}</Paragraph>
                              </div>
                            </div>
                            {comments.filter(r => r.parent_comment_id === comment.id).map(reply => (
                              <div key={reply.id} id={`comment-${reply.id}`} style={{ display: 'flex', gap: 12, marginLeft: 44, marginTop: 12, padding: 8, borderRadius: 8, backgroundColor: highlightedComment == reply.id ? '#fffbe6' : 'transparent', transition: 'background-color 1s ease-out' }}>
                                <Avatar icon={<UserOutlined />} size="small" />
                                <div style={{ flex: 1 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Space>
                                      <Text strong>{reply.user?.full_name || reply.user?.email}</Text>
                                      <Text type="secondary" style={{ fontSize: 12 }}>{dayjs(reply.created_at).format('DD/MM/YYYY HH:mm')}</Text>
                                    </Space>
                                    {(currentUser?.role === 'ADMIN' || currentUser?.id === reply.user_id) && (
                                      <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => handleDeleteComment(reply.id)} />
                                    )}
                                  </div>
                                  <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>{reply.content}</Paragraph>
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 12, marginTop: 16, position: 'sticky', bottom: 0, padding: '16px 24px 24px 24px', background: '#fff', borderTop: '1px solid #f0f0f0', zIndex: 10, margin: '16px -24px 0 -24px' }}>
                      <Avatar icon={<UserOutlined />} />
                      <div style={{ flex: 1, position: 'relative' }}>
                        {replyingTo && (
                          <div style={{ marginBottom: 8, padding: '4px 8px', background: '#f5f5f5', borderRadius: 4, display: 'flex', justifyContent: 'space-between' }}>
                            <Text type="secondary">Đang phản hồi <Text strong>{replyingTo.user?.full_name || replyingTo.user?.email}</Text></Text>
                            <Button type="text" size="small" onClick={() => setReplyingTo(null)}>Hủy</Button>
                          </div>
                        )}
                        <TextArea
                          rows={2}
                          placeholder="Nhập bình luận..."
                          value={newComment}
                          onChange={e => setNewComment(e.target.value)}
                          style={{ borderRadius: 8, paddingRight: 40 }}
                        />
                        <Button
                          type="text"
                          icon={<SendOutlined style={{ color: '#1890ff' }} />}
                          onClick={handleSendComment}
                          loading={submitting}
                          style={{ position: 'absolute', right: 4, bottom: 4 }}
                        />
                      </div>
                    </div>
                  </>
                ),
              },
              {
                key: 'history',
                label: 'Lịch sử',
                children: (
                  <div style={{ paddingTop: 8 }}>
                    {task.history && task.history.length > 0 ? (
                      <Timeline
                        items={task.history.map((entry: any) => ({
                          children: (
                            <div>
                              <Text>{renderHistoryLabel(entry)}</Text>
                              <div>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  {dayjs(entry.created_at).format('DD/MM/YYYY HH:mm')}
                                </Text>
                              </div>
                            </div>
                          ),
                        }))}
                      />
                    ) : (
                      <Empty description="Chưa có lịch sử thay đổi" />
                    )}
                  </div>
                ),
              },
            ]}
          />
        ) : (
          <Text type="secondary">Không tìm thấy thông tin task.</Text>
        )}
      </div>

      {/* Modal yêu cầu gia hạn deadline */}
      {task && (
        <Modal
          title="Yêu cầu gia hạn deadline"
          open={isExtensionModalVisible}
          onCancel={() => {
            setIsExtensionModalVisible(false);
            setRequestedDeadline('');
            setExtensionReason('');
          }}
          onOk={handleRequestExtension}
          okText="Gửi yêu cầu"
          cancelText="Hủy"
          confirmLoading={submittingExtension}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
            <div>
              <Text type="secondary">Deadline hiện tại:</Text>
              <Input
                value={task.deadline ? dayjs(task.deadline).format('DD/MM/YYYY') : 'Chưa đặt'}
                readOnly
                disabled
                style={{ marginTop: 8 }}
              />
            </div>
            <div>
              <Text type="secondary">Deadline mới mong muốn:</Text>
              <Input
                type="date"
                value={requestedDeadline}
                onChange={(e) => setRequestedDeadline(e.target.value)}
                style={{ marginTop: 8 }}
              />
            </div>
            <div>
              <Text type="secondary">Lý do gia hạn:</Text>
              <TextArea
                rows={4}
                placeholder="Nhập lý do chi tiết cần gia hạn..."
                value={extensionReason}
                onChange={(e) => setExtensionReason(e.target.value)}
                style={{ marginTop: 8 }}
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Modal duyệt yêu cầu gia hạn dành cho PM / Admin */}
      <Modal
        title={reviewAction === 'APPROVED' ? 'Phê duyệt yêu cầu gia hạn' : 'Từ chối yêu cầu gia hạn'}
        open={isReviewModalVisible}
        onCancel={() => {
          setIsReviewModalVisible(false);
          setReviewNote('');
          setReviewAction(null);
        }}
        onOk={handleConfirmReview}
        okText={reviewAction === 'APPROVED' ? 'Phê duyệt' : 'Từ chối'}
        okType={reviewAction === 'APPROVED' ? 'primary' : 'danger'}
        confirmLoading={submittingReview}
      >
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">Phản hồi của người duyệt (tùy chọn):</Text>
          <TextArea
            rows={4}
            placeholder="Nhập phản hồi hoặc lý do..."
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
            style={{ marginTop: 8 }}
          />
        </div>
      </Modal>
    </Modal>
  );
}

