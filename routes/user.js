const express = require('express');
const path = require('path');

const userController = require('../controllers/user');
const { 
  sendMessage, 
  getMessages 
} = require('../controllers/message');
const {
  createGroup,
  inviteUser,
  getGroupsForUser,
} = require('../controllers/group');

const auth = require('../middleware/auth');

const router = express.Router();

// User Authentication Routes
router.post('/user/signup', userController.postSignup); // User Signup
router.post('/user/login', userController.postLogin);   // User Login

// Group Routes
router.post('/groups/create', auth.au, createGroup);     // Create a group
router.post('/groups/:groupId/invite', auth.au,inviteUser); // Invite user to a group
router.get('/groups', auth.au, getGroupsForUser);        // Fetch all groups for a user

// Messaging Routes
router.post('/groups/:groupId/messages', auth.au, sendMessage); // Send a message in a group
router.get('/groups/:groupId/messages', auth.au, getMessages);  // Get messages for a group


const groupController = require('../controllers/group');
// Group Member Management Routes
router.post('/groups/:groupId/members/:memberId/make-admin', auth.au, groupController.makeAdmin);
router.delete('/groups/:groupId/members/:memberId', auth.au, groupController.removeMember);

// Route to fetch pending invitations for the logged-in user
router.get('/groups/pending-invites', auth.au, groupController.getPendingInvites);

// Route to accept an invitation
router.post('/groups/:groupId/accept-invite', auth.au, groupController.acceptInvite);

// Route to decline an invitation
router.post('/groups/:groupId/decline-invite', auth.au, groupController.declineInvite);

router.get('/groups/:groupId/members', auth.au, groupController.getGroupMembers);

// Route to change the role of a group member
router.post('/:groupId/members/:userId/role', auth.au, groupController.updateRole);


module.exports = router;
