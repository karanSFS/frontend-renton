import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, message, Tabs, Tooltip, Avatar, ConfigProvider, theme } from 'antd';
import { Check, X, Play, RotateCcw, Calendar, User, Truck, Clock } from 'lucide-react';
import api from '../../api/client';

const { TabPane } = Tabs;

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('All');

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const response = await api.get('/bookings');
            setBookings(response.data);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
            message.error('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.patch(`/bookings/${id}/status`, { status });
            message.success(`Booking marked as ${status}`);
            fetchBookings();
        } catch (error) {
            console.error('Update failed:', error);
            message.error(error.response?.data?.message || 'Update failed');
        }
    };

    // Custom Status Badge Component
    const StatusBadge = ({ status }) => {
        const styles = {
            Pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
            Approved: "bg-blue-500/10 text-blue-500 border-blue-500/20",
            PickedUp: "bg-purple-500/10 text-purple-500 border-purple-500/20", 
            Active: "bg-purple-500/10 text-purple-500 border-purple-500/20",
            Completed: "bg-green-500/10 text-green-500 border-green-500/20",
            Returned: "bg-green-500/10 text-green-500 border-green-500/20",
            Cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
            Rejected: "bg-red-500/10 text-red-500 border-red-500/20",
        };

        const className = styles[status] || "bg-gray-500/10 text-gray-500 border-gray-500/20";

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${className} backdrop-blur-md uppercase tracking-wider shadow-[0_0_10px_rgba(0,0,0,0.2)]`}>
                {status === 'PickedUp' ? 'ACTIVE' : status}
            </span>
        );
    };

    const columns = [
        {
            title: 'BOOKING ID',
            dataIndex: '_id',
            key: '_id',
            render: (text) => <span className="font-mono text-xs text-gray-500">#{text.slice(-6).toUpperCase()}</span>,
        },
        {
            title: 'USER DETAILS',
            dataIndex: 'user',
            key: 'user',
            render: (user) => (
                <div className="flex items-center gap-3">
                    <Avatar src={user?.profileImage} icon={<User />} className="bg-dark-800 border border-white/10" />
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-200 text-sm">{user?.name || 'Unknown User'}</span>
                        <span className="text-xs text-gray-500">{user?.email}</span>
                    </div>
                </div>
            ),
        },
        {
            title: 'VEHICLE',
            dataIndex: 'vehicle',
            key: 'vehicle',
            render: (vehicle) => (
                <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 group-hover:border-gold-500/50 transition-colors">
                        <img 
                            src={vehicle?.images?.[0] ? (vehicle.images[0].startsWith('http') ? vehicle.images[0] : `${import.meta.env.VITE_API_URL}${vehicle.images[0]}`) : 'https://via.placeholder.com/50'} 
                            alt="car" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-gray-200 font-medium group-hover:text-gold-500 transition-colors">{vehicle?.name}</span>
                        <span className="text-xs text-gold-500 font-bold">₹{vehicle?.pricePerDay}/day</span>
                    </div>
                </div>
            ),
        },
        {
            title: 'TIMELINE',
            key: 'duration',
            render: (_, record) => (
                <div className="flex flex-col text-xs space-y-1">
                    <div className="flex items-center gap-2 text-gray-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        <span>{new Date(record.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="h-4 border-l border-dashed border-gray-700 ml-[3px]"></div>
                    <div className="flex items-center gap-2 text-gray-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                        <span>{new Date(record.endDate).toLocaleDateString()}</span>
                    </div>
                </div>
            ),
        },
        {
            title: 'TOTAL',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            render: (price) => <span className="font-bold text-xl text-white font-display">₹{price.toLocaleString()}</span>,
        },
        {
            title: 'STATUS',
            dataIndex: 'status',
            key: 'status',
            render: (status) => <StatusBadge status={status} />,
        },
        {
            title: 'ACTIONS',
            key: 'actions',
            render: (_, record) => (
                <div className="flex gap-2">
                    {record.status === 'Pending' && (
                        <>
                            <Tooltip title="Approve Request">
                                <Button 
                                    className="border-green-500/30 text-green-500 hover:!bg-green-500 hover:!text-white hover:!border-green-500 bg-green-500/5 h-8 w-8 flex items-center justify-center p-0 rounded-lg backdrop-blur-sm transition-all"
                                    icon={<Check size={16} />}
                                    onClick={() => handleStatusUpdate(record._id, 'Approved')}
                                />
                            </Tooltip>
                            <Tooltip title="Reject Request">
                                <Button 
                                    className="border-red-500/30 text-red-500 hover:!bg-red-500 hover:!text-white hover:!border-red-500 bg-red-500/5 h-8 w-8 flex items-center justify-center p-0 rounded-lg backdrop-blur-sm transition-all"
                                    icon={<X size={16} />}
                                    onClick={() => handleStatusUpdate(record._id, 'Cancelled')}
                                />
                            </Tooltip>
                        </>
                    )}

                    {record.status === 'Approved' && (
                        <Tooltip title="Mark as Picked Up (Start Rental)">
                            <Button 
                                className="border-gold-500/30 text-gold-500 hover:!bg-gold-500 hover:!text-black hover:!border-gold-500 bg-gold-500/5 h-8 w-auto px-3 flex items-center justify-center rounded-lg backdrop-blur-sm transition-all font-bold text-xs gap-2"
                                onClick={() => handleStatusUpdate(record._id, 'PickedUp')}
                            >
                                <Play size={12} fill="currentColor" /> START RIDE
                            </Button>
                        </Tooltip>
                    )}

                    {record.status === 'PickedUp' && (
                        <Tooltip title="Mark as Returned (Complete)">
                            <Button 
                                className="border-gray-500/30 text-gray-300 hover:!bg-white hover:!text-black hover:!border-white bg-dark-800 h-8 w-auto px-3 flex items-center justify-center rounded-lg backdrop-blur-sm transition-all font-bold text-xs gap-2"
                                onClick={() => handleStatusUpdate(record._id, 'Returned')}
                            >
                                <RotateCcw size={12} /> RETURN
                            </Button>
                        </Tooltip>
                    )}
                </div>
            ),
        },
    ];

    const filteredBookings = filterStatus === 'All' 
        ? bookings 
        : bookings.filter(b => b.status === filterStatus);

    return (
        <ConfigProvider
            theme={{
                algorithm: theme.darkAlgorithm,
                token: {
                    colorPrimary: '#d4af37',
                    colorBgContainer: '#000000',
                },
                components: {
                    Table: {
                        colorBgContainer: 'transparent',
                        headerBg: '#111111',
                        headerColor: '#888',
                        borderColor: '#222',
                        rowHoverBg: '#1a1a1a',
                    },
                    Tabs: {
                        itemSelectedColor: '#d4af37',
                        itemHoverColor: '#aa8c2c',
                        inkBarColor: '#d4af37',
                    }
                }
            }}
        >
            <div className="space-y-8 animate-fade-in">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
                    <div>
                        <h2 className="text-3xl font-display font-bold text-white tracking-tight">Booking Management</h2>
                        <p className="text-gray-400 mt-1">Review and manage vehicle rental requests</p>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="bg-dark-900 border border-white/10 px-4 py-2 rounded-xl flex flex-col items-center">
                            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total</span>
                            <span className="text-xl font-bold text-white">{bookings.length}</span>
                       </div>
                       <div className="bg-dark-900 border border-white/10 px-4 py-2 rounded-xl flex flex-col items-center">
                            <span className="text-xs text-gold-500 font-bold uppercase tracking-wider">Pending</span>
                            <span className="text-xl font-bold text-gold-500">{bookings.filter(b => b.status === 'Pending').length}</span>
                       </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 overflow-hidden shadow-2xl">
                    <Tabs 
                        defaultActiveKey="All" 
                        onChange={setFilterStatus}
                        className="mb-6 custom-tabs"
                        items={[
                            { label: 'All Requests', key: 'All' },
                            { label: `Pending (${bookings.filter(b => b.status === 'Pending').length})`, key: 'Pending' },
                            { label: 'Active Rentals', key: 'PickedUp' },
                            { label: 'Completed', key: 'Completed' },
                            { label: 'Cancelled', key: 'Cancelled' },
                        ]}
                    />
                    
                    <Table
                        columns={columns}
                        dataSource={filteredBookings}
                        rowKey="_id"
                        loading={loading}
                        pagination={{ 
                            pageSize: 8, 
                            showSizeChanger: false,
                            className: "custom-pagination"
                        }}
                        className="premium-table"
                        scroll={{ x: 900 }}
                    />
                </div>

                {/* Custom Styling Injection for deep nested overrides */}
                <style>{`
                    .custom-tabs .ant-tabs-tab {
                        color: #666;
                        font-weight: 600;
                        padding: 12px 20px;
                        transition: all 0.3s;
                    }
                    .custom-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
                        color: #d4af37 !important;
                        text-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
                    }
                    .custom-tabs .ant-tabs-ink-bar {
                        height: 3px !important;
                        border-radius: 3px;
                    }
                    
                    /* Table Header Styling */
                    .premium-table .ant-table-thead > tr > th {
                        background: #0a0a0a !important;
                        border-bottom: 1px solid #222 !important;
                        font-size: 11px;
                        letter-spacing: 1px;
                        font-weight: 700;
                    }

                    /* Table Body Styling */
                    .premium-table .ant-table-tbody > tr > td {
                        border-bottom: 1px solid #1a1a1a !important;
                        padding: 20px 16px !important;
                    }
                    
                    /* Empty State Styling */
                    .ant-empty-description {
                        color: #444 !important;
                    }

                    /* Pagination Styling */
                    .custom-pagination .ant-pagination-item {
                        background: transparent !important;
                        border: 1px solid #333 !important;
                    }
                    .custom-pagination .ant-pagination-item-active {
                        border-color: #d4af37 !important;
                    }
                    .custom-pagination .ant-pagination-item a {
                        color: #888 !important;
                    }
                    .custom-pagination .ant-pagination-item-active a {
                        color: #d4af37 !important;
                        font-weight: bold;
                    }
                    .custom-pagination .ant-pagination-prev .ant-pagination-item-link,
                    .custom-pagination .ant-pagination-next .ant-pagination-item-link {
                        background: transparent !important;
                        border: 1px solid #333 !important;
                        color: #888 !important;
                    }
                `}</style>
            </div>
        </ConfigProvider>
    );
};

export default AdminBookings;
