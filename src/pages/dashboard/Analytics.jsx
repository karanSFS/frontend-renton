import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyBookings } from '../../redux/slices/bookingSlice';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { ArrowUp, ArrowDown, DollarSign, Calendar, TrendingUp, Users } from 'lucide-react';

const Analytics = () => {
    const dispatch = useDispatch();
    const { bookings, isLoading } = useSelector((state) => state.bookings);

    useEffect(() => {
        dispatch(fetchMyBookings());
    }, [dispatch]);

    // Process Data
    const analyticsData = useMemo(() => {
        if (!bookings || bookings.length === 0) return null;

        let totalSpent = 0;
        let totalTrips = bookings.length;
        let vehicleTypes = {};
        let monthlyData = {};

        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthKey = d.toLocaleString('default', { month: 'short' });
            monthlyData[monthKey] = { name: monthKey, amount: 0, trips: 0 };
        }

        bookings.forEach(booking => {
            const date = new Date(booking.startDate);
            const price = Number(booking.totalPrice) || 0;
            totalSpent += price;

            // Vehicle Type Count
            const type = booking.vehicleType || 'Other';
            vehicleTypes[type] = (vehicleTypes[type] || 0) + 1;

            // Monthly Data (simple matching for last 6 months based on month name for demo)
            // Ideally should match Year+Month
            const monthName = date.toLocaleString('default', { month: 'short' });
            if (monthlyData[monthName]) {
                monthlyData[monthName].amount += price;
                monthlyData[monthName].trips += 1;
            }
        });

        const avgTripCost = totalTrips > 0 ? Math.round(totalSpent / totalTrips) : 0;

        // Format for Charts
        const earningsChartData = Object.values(monthlyData);
        
        const vehicleTypeChartData = Object.keys(vehicleTypes).map(type => ({
            name: type,
            value: vehicleTypes[type]
        }));

        return {
            totalSpent,
            totalTrips,
            avgTripCost,
            earningsData: earningsChartData,
            vehicleTypeData: vehicleTypeChartData
        };
    }, [bookings]);

    const COLORS = ['#D4AF37', '#F59E0B', '#F97316', '#FFFFFF'];

    if (isLoading) return <div className="text-white">Loading Analytics...</div>;

    // Default empty state if no data
    const data = analyticsData || {
        totalSpent: 0,
        totalTrips: 0,
        avgTripCost: 0,
        earningsData: [],
        vehicleTypeData: []
    };

    const StatCard = ({ title, value, change, icon: Icon, isPositive, subtext }) => (
        <div className="bg-dark-900 border border-white/5 p-6 rounded-2xl hover:bg-white/5 transition-colors group">
            <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-gold-500 group-hover:bg-gold-500 group-hover:text-black transition-colors">
                    <Icon size={24} />
                </div>
                {change && (
                <span className={`text-sm font-bold flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {change} {isPositive ? <ArrowUp size={14}/> : <ArrowDown size={14}/>}
                </span>
                )}
            </div>
            <p className="text-gray-400 text-sm mb-1">{title}</p>
            <h3 className="text-2xl font-bold font-display text-white">{value}</h3>
            {subtext && <p className="text-xs text-gray-500 mt-2">{subtext}</p>}
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Spent" 
                    value={`₹${data.totalSpent.toLocaleString()}`} 
                    change="+12%" 
                    icon={DollarSign} 
                    isPositive={true} 
                    subtext="vs last reported period"
                />
                <StatCard 
                    title="Total Trips" 
                    value={data.totalTrips} 
                    change="+5%" 
                    icon={Calendar} 
                    isPositive={true}
                    subtext="Completed bookings"
                />
                <StatCard 
                    title="Avg. Trip Cost" 
                    value={`₹${data.avgTripCost.toLocaleString()}`} 
                    change="-2%" 
                    icon={TrendingUp} 
                    isPositive={false}
                    subtext="Based on booking history"
                />
                <StatCard 
                    title="Loyalty Points" 
                    value={`${Math.floor(data.totalSpent / 100)} pts`} 
                    change="+150" 
                    icon={Users} 
                    isPositive={true}
                    subtext="Earn 1 pt per ₹100 spent"
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Earnings Chart */}
                <div className="lg:col-span-2 bg-dark-900 border border-white/5 p-8 rounded-[2rem] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <TrendingUp size={100} className="text-white"/>
                    </div>
                    <h3 className="text-xl font-bold font-display text-white mb-6">Monthly Spending</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.earningsData}>
                                <defs>
                                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="name" stroke="#666" tick={{fill: '#666'}} axisLine={false} tickLine={false} dy={10} />
                                <YAxis stroke="#666" tick={{fill: '#666'}} axisLine={false} tickLine={false} prefix="₹" dx={-10} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px', padding: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                    formatter={(value) => [`₹${value}`, 'Spent']}
                                />
                                <Area type="monotone" dataKey="amount" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart */}
                <div className="lg:col-span-1 bg-dark-900 border border-white/5 p-8 rounded-[2rem]">
                     <h3 className="text-xl font-bold font-display text-white mb-6">Vehicle Preferences</h3>
                     {data.vehicleTypeData.length > 0 ? (
                         <>
                            <div className="h-[250px] w-full flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data.vehicleTypeData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {data.vehicleTypeData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex flex-wrap justify-center gap-4 mt-4">
                                {data.vehicleTypeData.map((entry, index) => (
                                    <div key={index} className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                        <span className="text-xs text-gray-300 font-bold">{entry.name}</span>
                                        <span className="text-xs text-gray-500">({entry.value})</span>
                                    </div>
                                ))}
                            </div>
                         </>
                     ) : (
                        <div className="h-[250px] flex items-center justify-center text-gray-500">
                            No booking data yet
                        </div>
                     )}
                </div>
            </div>
            
            <div className="bg-dark-900 border border-white/5 p-8 rounded-[2rem]">
                <h3 className="text-xl font-bold font-display text-white mb-6">Rental Frequency</h3>
                 <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.earningsData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="name" stroke="#666" tick={{fill: '#666'}} axisLine={false} tickLine={false} dy={10} />
                                <Tooltip 
                                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px', padding: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                    formatter={(value) => [`${value} Trips`, 'Total']}
                                />
                                <Bar dataKey="trips" fill="#F97316" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
            </div>

        </div>
    );
};

export default Analytics;
