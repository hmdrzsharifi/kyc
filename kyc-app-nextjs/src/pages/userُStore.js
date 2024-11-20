// src/data/user.js
export let userId = null;

export const setUserId = (id) => {
    userId = id;
};

export const getUserId = () => {
    return userId;
};
