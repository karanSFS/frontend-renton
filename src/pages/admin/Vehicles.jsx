import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X, Upload as UploadIcon, MapPin, Phone, Car, Settings as SettingsIcon, DollarSign, Info } from 'lucide-react';
import { Modal, Form, Input, InputNumber, Select, Switch, Upload, Button, message, Divider } from 'antd';
import api from '../../api/client';

const { TextArea } = Input;
const { Option } = Select;

const AdminVehicles = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);

    const fetchVehicles = async () => {
        try {
            const response = await api.get('/vehicles');
            setVehicles(response.data);
        } catch (error) {
            console.error('Failed to fetch vehicles', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to deactivate this vehicle?')) return;
        try {
            await api.delete(`/vehicles/${id}`);
            message.success('Vehicle deactivated successfully');
            fetchVehicles();
        } catch (error) {
            console.error('Failed to delete vehicle', error);
            message.error('Failed to deactivate vehicle');
        }
    };

    const handleEdit = (vehicle) => {
        setEditingVehicle(vehicle);
        setFileList([]); // Clear new files
        // Pre-fill form
        form.setFieldsValue({
            name: vehicle.name,
            type: vehicle.type,
            pricePerDay: vehicle.pricePerDay,
            extraChargePerHour: vehicle.extraChargePerHour,
            description: vehicle.description,
            transmission: vehicle.transmission,
            fuelType: vehicle.fuelType,
            capacity: vehicle.capacity,
            address: vehicle.address,
            lat: vehicle.pickupLocation?.lat,
            lng: vehicle.pickupLocation?.lng,
            isActive: vehicle.isActive,
            isAvailable: vehicle.isAvailable,
            contactPhone: vehicle.contactPhone, // Added field
        });
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingVehicle(null);
        setFileList([]);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setEditingVehicle(null);
    };

    const handleUploadChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };

    const onFinish = async (values) => {
        setFormLoading(true);
        const formData = new FormData();

        // Append simple fields
        Object.keys(values).forEach(key => {
            if (key !== 'lat' && key !== 'lng' && key !== 'images') {
                if (values[key] !== undefined) formData.append(key, values[key]);
            }
        });

        // Construct pickupLocation
        const location = {
            lat: parseFloat(values.lat),
            lng: parseFloat(values.lng)
        };
        formData.append('pickupLocation', JSON.stringify(location));

        // Append Images
        fileList.forEach(file => {
            // Strictly use originFileObj for new uploads via Ant Design
            if (file.originFileObj) {
                formData.append('images', file.originFileObj);
            } else if (file instanceof Blob) {
                // Fallback if fileList contains raw File objects (e.g. custom drag-drop)
                formData.append('images', file);
            }
        });

        const url = editingVehicle ? `/vehicles/${editingVehicle._id}` : '/vehicles';

        try {
            if (editingVehicle) {
                await api.put(url, formData);
            } else {
                await api.post(url, formData);
            }

            message.success(`Vehicle ${editingVehicle ? 'updated' : 'created'} successfully`);
            setIsModalOpen(false);
            fetchVehicles();
        } catch (error) {
            console.error('Form submission error', error);
            const errMsg = error.response?.data?.message || 'Something went wrong';
            message.error(errMsg);
        } finally {
            setFormLoading(false);
        }
    };

    if (loading) return <div className="text-white">Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white">Manage Vehicles</h2>
                <Button
                    type="primary"
                    onClick={handleAdd}
                    className="bg-gold-500 text-black border-none font-bold h-10 px-6 rounded-xl hover:!bg-white hover:!text-black flex items-center gap-2"
                >
                    <Plus size={18} /> Add Vehicle
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map(vehicle => (
                    <div key={vehicle._id} className={`bg-dark-900 border ${vehicle.isActive ? 'border-white/5' : 'border-red-500/50'} rounded-2xl overflow-hidden group relative`}>
                        {!vehicle.isActive && <div className="absolute inset-0 bg-black/60 z-10 flex items-center justify-center pointer-events-none"><span className="bg-red-500 text-white px-3 py-1 rounded font-bold">INACTIVE</span></div>}

                        <div className="h-48 overflow-hidden relative">
                            <img
                                src={vehicle.images?.[0]?.startsWith('http') ? vehicle.images[0] : vehicle.images?.[0] ? `${import.meta.env.VITE_API_URL}${vehicle.images[0]}` : 'https://via.placeholder.com/300'}
                                alt={vehicle.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-2 right-2 flex gap-2 z-20">
                                <button onClick={() => handleEdit(vehicle)} className="bg-black/50 text-white p-2 rounded-full hover:bg-blue-500 transition-colors"><Edit size={16} /></button>
                                <button onClick={() => handleDelete(vehicle._id)} className="bg-black/50 text-white p-2 rounded-full hover:bg-red-500 transition-colors"><Trash2 size={16} /></button>
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="text-xl font-bold text-white mb-1">{vehicle.name}</h3>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-gold-500 font-bold">₹{vehicle.price || vehicle.pricePerDay}<span className="text-gray-500 text-sm font-normal">/day</span></p>
                                    <p className="text-xs text-gray-400 mt-1">Extra: ₹{vehicle.extraChargePerHour}/hr</p>
                                </div>
                                <div className="flex gap-2 text-xs text-gray-400">
                                    <span className="px-2 py-1 bg-white/5 rounded border border-white/5">{vehicle.type}</span>
                                    <span className="px-2 py-1 bg-white/5 rounded border border-white/5">{vehicle.transmission}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Modal
                title={
                    <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                        <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center text-gold-500">
                            {editingVehicle ? <Edit size={20} /> : <Plus size={20} />}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
                            <p className="text-xs text-gray-500 font-normal">Fill in the details below to list a vehicle</p>
                        </div>
                    </div>
                }
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null}
                width={900}
                className="dark-modal"
                centered
            >
                <Form form={form} layout="vertical" onFinish={onFinish} className="mt-6 space-y-8">

                    {/* Section 1: Basic Details */}
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                        <h4 className="text-white font-bold mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                            <Car className="text-blue-500" size={18} /> Vehicle Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <Form.Item name="name" label={<span className="text-gray-400">Vehicle Name</span>} rules={[{ required: true }]}>
                                <Input placeholder="e.g. Tesla Model 3" className="!bg-dark-800 !border-white/10 !text-white h-12 rounded-xl focus:!border-gold-500 hover:!border-gold-500 placeholder:!text-white/70" />
                            </Form.Item>
                            <Form.Item name="type" label={<span className="text-gray-400">Type</span>} rules={[{ required: true }]}>
                                <Select className="custom-select h-12 rounded-xl !bg-dark-800 !border-white/10 text-white" placeholder="Select Type">
                                    <Option value="Car">Car</Option>
                                    <Option value="Bike">Bike</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item name="description" label={<span className="text-gray-400">Description</span>} rules={[{ required: true }]} className="md:col-span-2">
                                <TextArea rows={3} placeholder="Describe the vehicle's features..." className="!bg-dark-800 !border-white/10 !text-white rounded-xl focus:!border-gold-500 hover:!border-gold-500 placeholder:!text-white/70" />
                            </Form.Item>
                        </div>
                    </div>

                    {/* Section 2: Specs & Pricing */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                            <h4 className="text-white font-bold mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                                <SettingsIcon className="text-green-500" size={18} /> Technical Specs
                            </h4>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Form.Item name="transmission" label={<span className="text-gray-400">Transmission</span>}>
                                        <Select className="custom-select h-12 rounded-xl !bg-dark-800 !border-white/10 text-white">
                                            <Option value="Automatic">Automatic</Option>
                                            <Option value="Manual">Manual</Option>
                                        </Select>
                                    </Form.Item>
                                    <Form.Item name="fuelType" label={<span className="text-gray-400">Fuel Type</span>}>
                                        <Select className="custom-select h-12 rounded-xl !bg-dark-800 !border-white/10 text-white">
                                            <Option value="Petrol">Petrol</Option>
                                            <Option value="Diesel">Diesel</Option>
                                            <Option value="Electric">Electric</Option>
                                            <Option value="Hybrid">Hybrid</Option>
                                        </Select>
                                    </Form.Item>
                                </div>
                                <Form.Item name="capacity" label={<span className="text-gray-400">Capacity</span>}>
                                    <Input placeholder="e.g. 4 Persons" className="!bg-dark-800 !border-white/10 !text-white h-12 rounded-xl focus:!border-gold-500 hover:!border-gold-500 placeholder:!text-white/70" />
                                </Form.Item>
                            </div>
                        </div>

                        <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                            <h4 className="text-white font-bold mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                                <DollarSign className="text-gold-500" size={18} /> Pricing
                            </h4>
                            <div className="space-y-4">
                                <Form.Item name="pricePerDay" label={<span className="text-gray-400">Price Per Day (₹)</span>} rules={[{ required: true }]}>
                                    <InputNumber min={0} className="w-full !bg-dark-800 !border-white/10 !text-white h-12 rounded-xl focus:!border-gold-500 hover:!border-gold-500 placeholder:!text-white/70 pt-1" placeholder="0.00" />
                                </Form.Item>
                                <Form.Item name="extraChargePerHour" label={<span className="text-gray-400">Extra Charge / Hour (₹)</span>} rules={[{ required: true }]}>
                                    <InputNumber min={0} className="w-full !bg-dark-800 !border-white/10 !text-white h-12 rounded-xl focus:!border-gold-500 hover:!border-gold-500 placeholder:!text-white/70 pt-1" placeholder="0.00" />
                                </Form.Item>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Location & Contact (The Requested Feature) */}
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                        <h4 className="text-white font-bold mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                            <MapPin className="text-red-500" size={18} /> Location & Contact
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <Form.Item name="address" label={<span className="text-gray-400">Full Address</span>} rules={[{ required: true }]} className="md:col-span-2">
                                <Input prefix={<MapPin size={16} className="text-gray-500" />} placeholder="123 Example St, City, Country" className="!bg-dark-800 !border-white/10 !text-white h-12 rounded-xl focus:!border-gold-500 hover:!border-gold-500 placeholder:!text-white/70" />
                            </Form.Item>

                            <Form.Item name="lat" label={<span className="text-gray-400">Latitude</span>} rules={[{ required: true }]}>
                                <InputNumber className="w-full !bg-dark-800 !border-white/10 !text-white h-12 rounded-xl focus:!border-gold-500 hover:!border-gold-500 placeholder:!text-white/70 pt-1" step="0.000001" />
                            </Form.Item>
                            <Form.Item name="lng" label={<span className="text-gray-400">Longitude</span>} rules={[{ required: true }]}>
                                <InputNumber className="w-full !bg-dark-800 !border-white/10 !text-white h-12 rounded-xl focus:!border-gold-500 hover:!border-gold-500 placeholder:!text-white/70 pt-1" step="0.000001" />
                            </Form.Item>

                            {/* NEW FIELD: Contact Phone */}
                            <Form.Item name="contactPhone" label={<span className="text-gray-400">Owner Contact Number</span>} rules={[{ required: true, message: 'Please provide a contact number' }]} className="md:col-span-2">
                                <Input prefix={<Phone size={16} className="text-gold-500" />} placeholder="+91 98765 43210" className="!bg-dark-800 !border-white/10 !text-white h-12 rounded-xl focus:!border-gold-500 hover:!border-gold-500 placeholder:!text-white/70" />
                            </Form.Item>
                        </div>
                    </div>

                    {/* Section 4: Images & Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                            <h4 className="text-white font-bold mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                                <UploadIcon className="text-purple-500" size={18} /> Vehicle Images
                            </h4>
                            <Form.Item>
                                <Upload
                                    listType="picture-card"
                                    fileList={fileList}
                                    onChange={handleUploadChange}
                                    beforeUpload={() => false}
                                    multiple
                                    className="dark-upload"
                                >
                                    <div className="flex flex-col items-center justify-center text-gray-400 hover:text-white">
                                        <Plus size={20} />
                                        <div className="mt-2 text-xs">Upload</div>
                                    </div>
                                </Upload>
                            </Form.Item>
                        </div>

                        <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                            <h4 className="text-white font-bold mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                                <Info className="text-blue-400" size={18} /> Status & Visibility
                            </h4>
                            <div className="space-y-6 pt-2">
                                <Form.Item name="isAvailable" valuePropName="checked" className="mb-2">
                                    <div className="flex justify-between items-center w-full">
                                        <span className="text-gray-300">Available for Rent</span>
                                        <Switch className="bg-gray-600" />
                                    </div>
                                </Form.Item>
                                <Divider className="border-white/10 my-2" />
                                <Form.Item name="isActive" valuePropName="checked" className="mb-0">
                                    <div className="flex justify-between items-center w-full">
                                        <span className="text-gray-300">Active (Visible to Users)</span>
                                        <Switch className="bg-gold-500" />
                                    </div>
                                </Form.Item>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-white/10">
                        <Button
                            onClick={handleCancel}
                            className="h-11 px-8 rounded-xl border-white/10 text-gray-300 hover:text-white hover:border-white transition-colors bg-transparent"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={formLoading}
                            disabled={formLoading}
                            className="bg-gold-500 hover:bg-white text-black font-bold h-11 px-8 rounded-xl border-none transition-all shadow-lg shadow-gold-500/20"
                        >
                            {editingVehicle ? 'Update Vehicle' : 'Create Vehicle'}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminVehicles;
