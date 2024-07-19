// import Profile from './Profile.model.js';
// import {connectdb} from '../lib/db.js';

// // Function to update users
// export async function updateUsers() {
//     await connectdb();
//     try {
//     const profile = await Profile.find();

//     const updatePromises = profile.map(async (profile) => {
//       if (!profile.profileImageUrl) {
//         profile.profileImageUrl = null;
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
