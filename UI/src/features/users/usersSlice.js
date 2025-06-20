import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/users/';

export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
  const response = await axios.get(API_URL);
  return response.data;
});

export const addUser = createAsyncThunk('users/addUser', async (user) => {
  const response = await axios.post(API_URL, user);
  return response.data;
});

export const updateUser = createAsyncThunk('users/updateUser', async (user) => {
  const response = await axios.put(`${API_URL}${user.id}`, user);
  return response.data;
});

export const deleteUser = createAsyncThunk('users/deleteUser', async (id) => {
  await axios.delete(`${API_URL}${id}`);
  return id;
});

export const deleteMultipleUsers = createAsyncThunk('users/deleteMultipleUsers', async (ids) => {
  await Promise.all(ids.map(id => axios.delete(`${API_URL}${id}`)));
  return ids;
});

const loadDeletedUserIds = () => {
  try {
    const serializedData = localStorage.getItem('deletedUserIds');
    if (serializedData === null) {
      return [];
    }
    return JSON.parse(serializedData);
  } catch (e) {
    return [];
  }
};

const saveDeletedUserIds = (ids) => {
  try {
    const serializedData = JSON.stringify(ids);
    localStorage.setItem('deletedUserIds', serializedData);
  } catch (e) {
    // ignore write errors
  }
};

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    users: [],
    loading: false,
    error: null,
    deletedUserIds: loadDeletedUserIds(),
  },
  reducers: {
    setUsers(state, action) {
      state.users = action.payload;
    },
    addDeletedUserIds(state, action) {
      state.deletedUserIds = [...new Set([...state.deletedUserIds, ...action.payload])];
      saveDeletedUserIds(state.deletedUserIds);
      // Also remove deleted users from users list in state
      state.users = state.users.filter(user => !state.deletedUserIds.includes(user.id));
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchUsers
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        // Filter out deleted users
        state.users = action.payload.filter(user => !state.deletedUserIds.includes(user.id));
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // addUser
      .addCase(addUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
      })
      .addCase(addUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // updateUser
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // deleteUser
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(user => user.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // deleteMultipleUsers
      .addCase(deleteMultipleUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMultipleUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(user => !action.payload.includes(user.id));
      })
      .addCase(deleteMultipleUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { setUsers, addDeletedUserIds } = usersSlice.actions;

export default usersSlice.reducer;
