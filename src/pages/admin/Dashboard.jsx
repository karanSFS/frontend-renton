import React, { useEffect, useState } from 'react';
import { Users, Car, Calendar, DollarSign, TrendingUp, BarChart3, PieChart, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import api from '../../api/client';


const AdminDashboard = () => {
    const [stats, setStats] = useState({
        users: 0,
        vehicles: 0,
        activeBookings: 0,
        revenue: 0,
        graphData: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/bookings/admin/stats');
                setStats(response.data);
            } catch (error) {
                console.error('Failed to fetch admin stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const formattedGraphData = stats.graphData?.map(item => {
        const date = new Date();
        date.setMonth(item._id.month - 1);
        return {
            name: date.toLocaleString('default', { month: 'short' }),
            revenue: item.revenue,
            bookings: item.bookings
        };
    }) || [];

    // Fallback data if no revenue yet (for visual demo)
    const chartData = formattedGraphData.length > 0 ? formattedGraphData : [
        { name: 'Jan', revenue: 0 },
        { name: 'Feb', revenue: 0 },
        { name: 'Mar', revenue: 0 },
        { name: 'Apr', revenue: 0 },
        { name: 'May', revenue: 0 },
        { name: 'Jun', revenue: 0 },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header / Logo Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/10 pb-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gold-500 rounded-lg flex items-center justify-center text-black font-black text-xl shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                            R
                        </div>
                        <h1 className="text-4xl font-display font-bold text-white tracking-tight">
                            Rent<span className="text-gold-500">On</span> <span className="text-2xl text-gray-400 font-normal">Admin</span>
                        </h1>
                    </div>
                    <p className="text-gray-400">Overview of system performance and key metrics.</p>
                </div>
                <div className="flex gap-3">
                   <div className="px-4 py-2 bg-dark-800 rounded-lg border border-white/5 text-xs text-gray-400 font-mono">
                        Server Status: <span className="text-green-500 font-bold">ONLINE</span>
                   </div>
                </div>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Users */}
                <div className="bg-gradient-to-br from-dark-900 to-black p-6 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users size={80} className="text-blue-500" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                            <Users size={24}/>
                        </div>
                    </div>
                    <div>
                        <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Users</span>
                        <p className="text-3xl font-bold text-white mt-1 group-hover:scale-105 transition-transform origin-left">{stats.users}</p>
                    </div>
                </div>
                
                {/* Total Vehicles */}
                 <div className="bg-gradient-to-br from-dark-900 to-black p-6 rounded-2xl border border-white/5 hover:border-gold-500/30 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Car size={80} className="text-gold-500" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-gold-500/10 text-gold-500 rounded-xl shadow-[0_0_10px_rgba(212,175,55,0.2)]">
                            <Car size={24}/>
                        </div>
                    </div>
                    <div>
                        <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Vehicles</span>
                        <p className="text-3xl font-bold text-white mt-1 group-hover:scale-105 transition-transform origin-left">{stats.vehicles}</p>
                    </div>
                </div>

                {/* Revenue */}
                 <div className="bg-gradient-to-br from-dark-900 to-black p-6 rounded-2xl border border-white/5 hover:border-green-500/30 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign size={80} className="text-green-500" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-green-500/10 text-green-500 rounded-xl shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                            <TrendingUp size={24}/>
                        </div>
                    </div>
                    <div>
                        <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Revenue</span>
                        <p className="text-3xl font-bold text-white mt-1 group-hover:scale-105 transition-transform origin-left font-mono tracking-tight">₹{stats.revenue.toLocaleString()}</p>
                    </div>
                </div>

                {/* Active Bookings */}
                 <div className="bg-gradient-to-br from-dark-900 to-black p-6 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Activity size={80} className="text-purple-500" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                            <Calendar size={24}/>
                        </div>
                    </div>
                     <div>
                        <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Active Bookings</span>
                        <p className="text-3xl font-bold text-white mt-1 group-hover:scale-105 transition-transform origin-left">{stats.activeBookings}</p>
                    </div>
                </div>
            </div>

            {/* Graphs Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Graph */}
                <div className="bg-dark-900 border border-white/5 p-6 rounded-3xl shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <DollarSign className="text-gold-500" size={20}/> Revenue Trends
                            </h3>
                            <p className="text-gray-500 text-sm">Monthly revenue performance</p>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#666" 
                                    tick={{fill: '#666', fontSize: 12}} 
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis 
                                    stroke="#666" 
                                    tick={{fill: '#666', fontSize: 12}} 
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(value) => `₹${value/1000}k`}
                                />
                                <Tooltip 
                                    contentStyle={{backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff'}}
                                    itemStyle={{color: '#d4af37'}}
                                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="revenue" 
                                    stroke="#d4af37" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorRevenue)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Bookings Graph */}
                <div className="bg-dark-900 border border-white/5 p-6 rounded-3xl shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                             <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <BarChart3 className="text-blue-500" size={20}/> Booking Activity
                            </h3>
                            <p className="text-gray-500 text-sm">Monthly booking volume</p>
                        </div>
                    </div>
                     <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#666" 
                                    tick={{fill: '#666', fontSize: 12}} 
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis 
                                    stroke="#666" 
                                    tick={{fill: '#666', fontSize: 12}} 
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip 
                                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                    contentStyle={{backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff'}}
                                    itemStyle={{color: '#3b82f6'}}
                                    formatter={(value) => [value, 'Bookings']}
                                />
                                <Bar 
                                    dataKey="bookings" 
                                    fill="#3b82f6" 
                                    radius={[4, 4, 0, 0]}
                                    barSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
