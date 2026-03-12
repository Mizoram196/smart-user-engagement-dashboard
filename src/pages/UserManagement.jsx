import React, { useState, useEffect } from 'react';
import { getUsers, addUser, updateUser, deleteUser } from '../services/api';
import { Trash2, Edit2, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

const UserManagement = () => {
    const [allUsers, setAllUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ id: '', name: '', email: '', password: '', role: 'User' });
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name'); // name, email, role, date

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = () => {
        getUsers().then(res => setAllUsers(res));
    };

    const handleOpenModal = (user = null) => {
        if (user) {
            setIsEditing(true);
            setFormData({ id: user._id || user.id, name: user.name, email: user.email, password: '', role: user.role });
        } else {
            setIsEditing(false);
            setFormData({ id: '', name: '', email: '', password: '', role: 'User' });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await updateUser(formData.id, formData);
                toast.success('User updated successfully!');
            } else {
                await addUser(formData);
                toast.success('User added successfully!');
            }
            setShowModal(false);
            loadUsers();
        } catch (error) {
            toast.error('Operation failed: ' + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await deleteUser(id);
                toast.success('User deleted.');
                loadUsers();
            } catch (error) {
                toast.error('Deletion failed');
            }
        }
    };

    const filteredUsers = allUsers
        .filter(u =>
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'email') return a.email.localeCompare(b.email);
            if (sortBy === 'role') return a.role.localeCompare(b.role);
            if (sortBy === 'date') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
            return 0;
        });

    return (
        <div className="dashboard-content" style={{ position: 'relative' }}>
            <div className="page-header">
                <h1 className="page-title">User Management</h1>
                <p className="page-subtitle">View and manage platform users and their roles.</p>
            </div>

            <div className="table-card glass-panel" style={{ backgroundColor: 'var(--bg-secondary)', padding: '0', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: '300px' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <input
                                type="text"
                                placeholder="Search users by name or email..."
                                className="input-field"
                                style={{ paddingLeft: '2.5rem' }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                                🔍
                            </div>
                        </div>
                        <select
                            className="input-field"
                            style={{ width: '150px' }}
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="name">Sort by Name</option>
                            <option value="email">Sort by Email</option>
                            <option value="role">Sort by Role</option>
                            <option value="date">Sort by Recent</option>
                        </select>
                    </div>
                    <button onClick={() => handleOpenModal()} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Plus size={16} /> Add User
                    </button>
                </div>
                <div className="table-responsive">
                    <table>
                        <thead style={{ backgroundColor: 'var(--bg-primary)' }}>
                            <tr>
                                <th style={{ paddingLeft: '1.5rem' }}>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Joined</th>
                                <th style={{ paddingRight: '1.5rem', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((u) => (
                                <tr key={u._id || u.id}>
                                    <td style={{ paddingLeft: '1.5rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--input-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-color)' }}>
                                            {u.name.charAt(0)}
                                        </div>
                                        {u.name}
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                                    <td>
                                        <span className={`badge ${u.role === 'Admin' ? 'badge-admin' : 'badge-user'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)' }}>
                                        {u.created_at || u.createdAt ? new Date(u.created_at || u.createdAt).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td style={{ paddingRight: '1.5rem', textAlign: 'right' }}>
                                        <button onClick={() => handleOpenModal(u)} className="btn" style={{ fontSize: '0.875rem', padding: '0.4rem', color: 'var(--accent-color)', marginRight: '0.5rem' }}>
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(u._id || u.id)} className="btn" style={{ fontSize: '0.875rem', padding: '0.4rem', color: 'var(--danger)' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                        No users found matching "{searchTerm}"
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div className="glass-panel" style={{ width: '400px', backgroundColor: 'var(--bg-primary)', position: 'relative' }}>
                        <button onClick={handleCloseModal} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                        <h2 style={{ marginBottom: '1.5rem' }}>{isEditing ? 'Edit User' : 'Add New User'}</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Name</label>
                                <input required className="input-field" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Email</label>
                                <input required type="email" className="input-field" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Password {isEditing && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>(Leave blank to keep current)</span>}</label>
                                <input required={!isEditing} type="password" className="input-field" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Role</label>
                                <select className="input-field" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                    <option value="User">User</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                                {isEditing ? 'Save Changes' : 'Create User'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
