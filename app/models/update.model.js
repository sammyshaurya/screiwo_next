// import Profile from './Profile.model.mjs';
// import {connectdb} from '../lib/db.mjs';

// // Function to update users
// async function updateUsers() {
//     await connectdb();
//     try {
//     const profile = await Profile.find();

//     const updatePromises = profile.map(async (profile) => {
//       if (!profile.FollowersList) {
//         profile.FollowersList = [];
//       }
//       if (!profile.FollowingsList) {
//         profile.FollowingsList = [];
//       }

//       return profile.save();
//     });

//     await Promise.all(updatePromises);

//     console.log('All users updated successfully');
//   } catch (err) {
//     console.error('Error updating users:', err.message);
//   }
// }
// updateUsers();
