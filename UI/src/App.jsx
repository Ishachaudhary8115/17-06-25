import React, { useState } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import store from './store';
import { addUser, updateUser, fetchUsers, addDeletedUserIds } from './features/users/usersSlice';


function Users() {
  const dispatch = useDispatch();
  const users = useSelector((state) => state.users.users); // fixed property name
  const loading = useSelector((state) => state.users.loading);
  const error = useSelector((state) => state.users.error);

  React.useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({ id: null, name: '', email: '', password: '', phone: '' });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCheckboxChange = (id) => {
    setSelectedIds((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((selectedId) => selectedId !== id)
        : [...prevSelected, id]
    );
  };

  const handleSelectAllChange = (e) => {
    if (e.target.checked) {
      const allIds = filteredUsers.map((user) => user.id);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;

    const confirmed = await Swal.fire({
      title: `Are you sure you want to delete ${selectedIds.length} selected user(s)?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
    });

    if (confirmed.isConfirmed) {
      try {
        // ❌ Don't call backend
        // await dispatch(deleteMultipleUsers(selectedIds)).unwrap();

        // ✅ Only update local UI by adding to deletedUserIds
        dispatch(addDeletedUserIds(selectedIds));

        setSelectedIds([]);
        Swal.fire('Deleted!', 'Selected users removed from UI only.', 'success');
      } catch (error) {
        Swal.fire('Error', 'Failed to delete users.', 'error');
      }
    }
  };


  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError(null);
    setValidationErrors({});

    const errors = {};
    if (newUser.password.length > 8) {
      errors.password = 'Required 8 digit max';
    }
    if (!/^\d{10}$/.test(newUser.phone)) {
      errors.phone = 'Required 10 digit';
    }
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setAddLoading(false);
      return;
    }

    try {
      if (newUser.id) {
        await dispatch(updateUser(newUser)).unwrap();
        Swal.fire('Success', 'User updated successfully.', 'success');
      } else {
        await dispatch(addUser(newUser)).unwrap();
        Swal.fire('Success', 'User added successfully.', 'success');
      }
      setNewUser({ id: null, name: '', email: '', password: '', phone: '' });
      setShowModal(false);
    } catch (err) {
      setAddError(err.message || 'Failed to save user');
      Swal.fire('Error', err.message || 'Failed to save user', 'error');
    } finally {
      setAddLoading(false);
    }
  };

 const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase();
    return (
      (user.name && user.name.toLowerCase().includes(term)) ||
      (user.email && user.email.toLowerCase().includes(term)) ||
      (user.password && user.password.toLowerCase().includes(term)) ||
      (user.phone && user.phone.toLowerCase().includes(term))
    );
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4 text-center text-primary">User Management</h1>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <button
          className="btn btn-success btn-lg shadow-sm"
          onClick={() => {
            setNewUser({ id: null, name: '', email: '', password: '', phone: '' });
            setShowModal(true);
          }}
        >
          Add User
        </button>

        <input
          type="text"
          className="form-control w-50 shadow-sm"
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={handleSearchChange}
        />

        <button
          className="btn btn-danger btn-lg shadow-sm"
          onClick={handleDeleteSelected}
          disabled={selectedIds.length === 0}
        >
          Delete Selected
        </button>
      </div>

      <div className="card shadow-sm rounded">
        <div className="card-body p-0">
          {loading && <p className="text-center my-3">Loading users...</p>}
          {error && <p className="text-danger text-center my-3">Error: {error}</p>}
          <table className="table table-hover mb-0">
            <thead className="table-primary">
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={handleSelectAllChange}
                    checked={selectedIds.length === filteredUsers.length && filteredUsers.length > 0}
                  />
                </th>
                <th>Name</th>
                <th>Email</th>
                <th>Password</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-3">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="table-row-hover">
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(user.id)}
                        onChange={() => handleCheckboxChange(user.id)}
                      />
                    </td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.password ? '••••••' : ''}</td>
                    <td>{user.phone}</td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm shadow-sm"
                        onClick={() => {
                          setNewUser(user);
                          setShowModal(true);
                        }}
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content shadow-lg rounded">
              <form onSubmit={handleAddUser}>
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">{newUser.id ? 'Update User' : 'Add New User'}</h5>
                  <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <input
                      type="text"
                      name="name"
                      className="form-control shadow-sm"
                      placeholder="Name"
                      value={newUser.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="email"
                      name="email"
                      className="form-control shadow-sm"
                      placeholder="Email"
                      value={newUser.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="password"
                      name="password"
                      className="form-control shadow-sm"
                      placeholder="Password"
                      value={newUser.password}
                      onChange={handleInputChange}
                      required
                    />
                    {validationErrors.password && <p className="text-danger">{validationErrors.password}</p>}
                  </div>
                  <div className="mb-3">
                    <input
                      type="phone"
                      name="phone"
                      className="form-control shadow-sm"
                      placeholder="phone"
                      value={newUser.phone}
                      onChange={handleInputChange}
                      required
                    />
                    {validationErrors.phone && <p className="text-danger">{validationErrors.phone}</p>}
                  </div>
                  {addError && <p className="text-danger">{addError}</p>}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary shadow-sm" onClick={() => setShowModal(false)}>
                    Close
                  </button>
                  <button type="submit" className="btn btn-primary shadow-sm" disabled={addLoading}>
                    {addLoading ? (newUser.id ? 'Updating...' : 'Adding...') : (newUser.id ? 'Update User' : 'Add User')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <Users />
    </Provider>
  );
}

export default App;
