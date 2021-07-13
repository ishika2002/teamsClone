


# Microsoft Teams Clone 

This application is inspired by Microsoft teams and provides a platform to perform video conferencing and includes several other faetures realted to the same.


**Technologies Used**

![NODE JS](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) ![HTML](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white) ![CSS](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white) ![JS](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E) ![MONGO DB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white) ![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)

  

**Hosted On**

![Heroku](https://img.shields.io/badge/Heroku-430098?style=for-the-badge&logo=heroku&logoColor=white)

  

[Have a look at it ! ](https://mtco.herokuapp.com)

  

**Some major features included are:**

- Multi-participants
- Video Conference 🎥
- Audio Chat 📣
- Toggling of Video Stream
- Toggling of Audio Stream
- Side by side participant's textual chat 💬
- Screen Share 🖼
- Hand raise feature (Participants will be distinguished in the participants list window) ✋
- Glow around video appears if someone is speaking or has raised their hand
- Chat can be continued even after the end of any conference 🕶
- Screen Recording


## Flow of my Application 🗺

**1. Application Landing page 🛬**
    Every user will have to login by clicking on the login button.

**2. Authentication Control 🔐**

 - Login
  Existing user can login by using their credentials that are username and password.

 - Sign Up 
   New users can sign up by clicking on create new account. Sign Up page will open where details such as name, e-mail, username and password are supposed to be filled. Then clicking on Sign Up button will create a new account and user can login to move further. 

 - Forgot Password (Reset link will be sent to user's registered email address)

**3. User's Personal Home Page 👤**

 - Create a room or Join one
   After logging in User's personal home page will open. By clicking on the plus button on the bottom left corner a popup window will open. One can either create a new room by entering a room name and clicking on create button or he can join an existing room by clicking on join button. After clicking on join a new popup will open where one can fill in a room ID and join that room.
   
 - Chat with other users
   User can click on any room and can chat with all the users who have joined that room.
   This chat can be continued in the meeting of that respective room as well.

 - Join a meeting
  Not only this, for every room a meeting can be started by clicking on the camera button at top-right corner. After clicking it, the user will be directed to the conference room.
 
**4. Conference Room**
In the main window one can see the video streams of the users in the meeting. At the bottom several buttons are given to access different functionalities.

 - Video
 The user can turn on / off their videos by clicking on the video button given on the bottom bar.

 - Audio
  The user can mute / unmute themselves by clicking the mic button given on the bottom bar.

 - Screen Share
  User can share their screen with other people in the meeting by clicking on the share screen button given on the bottom bar.

 - Participants Text Chat
  Chat can be done with everyone by clicking on the chat button given on the bottom bar.
  This chat can be continued in the chat room of the respective meeting room.
  
 - Participant's List
  By clicking on the participant's list, names of all the meeting particiapnts can be seen.

 - Raise Hand
In a meeting, one can raise hand which will display a glow around his/her video fro all other users. Moreover a raise hand symbol will appear in front of your name in the participant's list.

 - Record Session
Anyone can record the meeting by clicking on the record button. A message with a stop button will appear as soon as recording starts clicking on which the recording will stop and a message with download will appear. The recorded video can be dowloaded by clicking it.

 - Share Meeting link/info
  Clicking it meeting information will be displayed in a popup from where the room ID can be copied and shared with other people.
  
 -   Leave meeting
On clicking the leave meeting, user will leave the meeting and will be redirected to his/her personal home page.


  **Working of the major components**
  
The whole application is based on node.js which is a platform built on Chrome's Javascript runtime for building fast and scalable network applications. It can handle large amount of simultaneous connections in a non-blocking manner, is light weight and efficient.

To establish connection between browser and server socket.io library is used. The functionalities of joining room, sending messages across rooms,  raising hand,  glowing of video by voice recognition, listing of participants are all performed using this.

For sharing the video streams peer.js library is used which wraps the browser's WebRTC implementation to provide a peer-to-peer connection API. A peer will be equipped with an ID and can create a media stream connection to a remote peer.

For all the storage purposes MongoDB is used a the database.  As mongoDB is a NoSQL database, it supports rapid development cycles needed for the application. The documents in it are JSON files which are human readable, natural form to store data and both structured and unstructured information can be stored in the same document. This document data model is a powerful way to store and retrieve data that makes development fast.
 

**Inspired By**

![Microsoft Teams](https://img.shields.io/badge/Microsoft_Teams-6264A7?style=for-the-badge&logo=microsoft-teams&logoColor=white) ![Google Meet](https://img.shields.io/badge/Google%20Meet-32A350?style=for-the-badge&logo=google-meet&logoColor=white)  
  

**Hope you liked my project!**


  

