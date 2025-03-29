const Group = require('../models/groupmodel');
 
const GroupMember = require('../models/groupmembermodel');
const User = require('../models/usermodel');
const Message = require('../models/messagemodel');

exports.getGroupsForUser = async (req, res) => {
  try {

    console.log("-------------------------------------------------------------------------------------groupController")
    const groups = await GroupMember.findAll({
      where: { userId: req.user.id },
      include: [{ model: Group, attributes: ['id', 'name'] }],
    });

    console.log(groups);
    const groupList = groups.map(g => ({
      id: g.group.id,
      name: g.group.name,
    }));

    res.status(200).json({ success: true, groups: groupList });
  } catch (err) {
    console.error('Error fetching groups:', err);
    res.status(500).json({ success: false, message: 'Internal server error while fetching groups.' });
  }
};

  exports.getMessages = async (req, res) => {
    try {
      const { groupId } = req.params;
  
      // Fetch all messages for the group
      const messages = await Message.findAll({
        where: { groupId },
        include: [{ model: User, attributes: ['username', 'email'] }],
        order: [['createdAt', 'ASC']],
      });
  
      const formattedMessages = messages.map(msg => ({
        id: msg.id,
        userId: msg.userId,
        username: msg.user.username,
        email: msg.user.email,
        message: msg.message,
        createdAt: msg.createdAt,
      }));
  
      res.status(200).json({ success: true, messages: formattedMessages });
    } catch (err) {
      console.error('Error fetching messages:', err);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };


exports.createGroup = async (req, res) => {
  try {
    const { name } = req.body;

    // Create the group
    const group = await Group.create({ name, adminId: req.user.id });

    // Add the creator as the admin member
    await GroupMember.create({
      groupId: group.id,
      userId: req.user.id,
      role: 'admin',
    });

    res.status(201).json({ success: true, message: 'Group created successfully', groupId: group.id });
  } catch (err) {
    console.error('Error creating group:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
exports.inviteUser = async (req, res) => {
  try {
    const { email } = req.body;
    const { groupId } = req.params;

    // Find the user to be invited
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if the user is already in the group
    const existingMember = await GroupMember.findOne({ where: { groupId, userId: user.id } });
    if (existingMember) {
      return res.status(400).json({ success: false, message: 'User already in the group' });
    }

    // Add the user as a group member
    await GroupMember.create({
      groupId,
      userId: user.id,
      role: 'member',
    });

    res.status(200).json({ success: true, message: 'User invited successfully' });
  } catch (err) {
    console.error('Error inviting user:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};



exports.getPendingInvites = async (req, res) => {
  try {
      const userId = req.user.id; // Logged-in user's ID

      // Find pending invitations for the user
      const invites = await GroupMember.findAll({
          where: { userId, status: 'pending' }, // Fetch pending invitations
          include: [{ model: Group, attributes: ['id', 'name'] }] // Include group details
      });

      const formattedInvites = invites.map(invite => ({
          groupId: invite.groupId,
          groupName: invite.group.name
      }));

      res.status(200).json({ invites: formattedInvites });
  } catch (error) {
      console.error('Error fetching pending invites:', error);
      res.status(500).json({ message: 'Failed to fetch pending invites' });
  }
};


exports.acceptInvite = async (req, res) => {
  try {
      const { groupId } = req.params;
      const userId = req.user.id; // Logged-in user's ID

      // Update the invite status to 'accepted'
      const invite = await GroupMember.findOne({ where: { groupId, userId, status: 'pending' } });
      if (!invite) {
          return res.status(404).json({ message: 'Invitation not found' });
      }

      invite.status = 'accepted';
      await invite.save();

      res.status(200).json({ message: 'Successfully joined the group' });
  } catch (error) {
      console.error('Error accepting invite:', error);
      res.status(500).json({ message: 'Failed to accept invite' });
  }
};


exports.declineInvite = async (req, res) => {
  try {
      const { groupId } = req.params;
      const userId = req.user.id; // Logged-in user's ID

      // Delete the invitation
      const invite = await GroupMember.findOne({ where: { groupId, userId, status: 'pending' } });
      if (!invite) {
          return res.status(404).json({ message: 'Invitation not found' });
      }

      await invite.destroy(); // Remove the invitation
      res.status(200).json({ message: 'Invitation declined' });
  } catch (error) {
      console.error('Error declining invite:', error);
      res.status(500).json({ message: 'Failed to decline invite' });
  }
};

exports.getGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    // Check if the requesting user is an admin of the group
    const adminCheck = await GroupMember.findOne({
      where: { groupId, userId, role: 'admin' },
    });

    // Fetch group members and their roles
    const members = await GroupMember.findAll({
      where: { groupId },
      include: [
        {
          model: User,
          attributes: ['id', 'username'], // Include member IDs and usernames
        },
      ],
    });

    // Format the members list for response
    const formattedMembers = members.map(member => ({
      id: member.user.id,
      username: member.user.username,
      role: member.role, // Either 'admin' or 'member'
    }));

    res.status(200).json({
      members: formattedMembers,
      isAdmin: !!adminCheck, // True if the user is an admin, otherwise false
    });
  } catch (error) {
    console.error('Error fetching group members:', error);
    res.status(500).json({ message: 'Failed to fetch group members' });
  }
};


exports.updateRole = async (req, res) => {
  try {
      const { groupId, userId } = req.params;
      const { role } = req.body; // 'admin' or 'member'
      const currentUser = req.user.id; // User trying to change the role

      // Ensure the current user is an admin of the group
      const groupMember = await GroupMember.findOne({ where: { groupId, userId: currentUser, role: 'admin' } });
      if (!groupMember) {
          return res.status(403).json({ message: 'Permission denied' });
      }

      // Update the role of the specified user
      const memberToUpdate = await GroupMember.findOne({ where: { groupId, userId } });
      if (!memberToUpdate) {
          return res.status(404).json({ message: 'Member not found' });
      }

      memberToUpdate.role = role; // Update role
      await memberToUpdate.save();

      res.status(200).json({ message: 'Role updated successfully' });
  } catch (error) {
      console.error('Error updating role:', error);
      res.status(500).json({ message: 'Failed to update role' });
  }
};


exports.makeAdmin = async (req, res) => {
  const { groupId, memberId } = req.params;
  const userId = req.user.id; // Logged-in user's ID

  try {
    // Check if the logged-in user is an admin of the group
    const adminCheck = await GroupMember.findOne({ where: { groupId, userId, role: 'admin' } });
    if (!adminCheck) {
      return res.status(403).json({ message: 'Only admins can promote other members to admin.' });
    }

    // Update the member's role to 'admin'
    const member = await GroupMember.findOne({ where: { groupId, userId: memberId } });
    if (!member) {
      return res.status(404).json({ message: 'Member not found in the group.' });
    }

    await member.update({ role: 'admin' });
    res.status(200).json({ message: 'Member successfully promoted to admin.' });
  } catch (error) {
    console.error('Error promoting member to admin:', error);
    res.status(500).json({ message: 'Failed to promote member to admin.' });
  }
};

exports.removeMember = async (req, res) => {
  const { groupId, memberId } = req.params;
  const userId = req.user.id; // Logged-in user's ID

  try {
    // Check if the logged-in user is an admin of the group
    const adminCheck = await GroupMember.findOne({ where: { groupId, userId, role: 'admin' } });
    if (!adminCheck) {
      return res.status(403).json({ message: 'Only admins can remove members from the group.' });
    }

    // Remove the member from the group
    const member = await GroupMember.findOne({ where: { groupId, userId: memberId } });
    if (!member) {
      return res.status(404).json({ message: 'Member not found in the group.' });
    }

    await member.destroy();
    res.status(200).json({ message: 'Member successfully removed from the group.' });
  } catch (error) {
    console.error('Error removing member from group:', error);
    res.status(500).json({ message: 'Failed to remove member from the group.' });
  }
};
