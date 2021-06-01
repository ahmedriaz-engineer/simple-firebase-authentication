import './App.css';
import firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';
import { useState } from 'react';

firebase.initializeApp(firebaseConfig);

function App() {
  const [newUser, setNewUser] = useState(false);
  const [user, setUser] = useState({
    isSignedIn: false,
    name: '',
    email: '',
    password: '',
    photoURL: '',
    newUser: false

  });
  const googleProvider = new firebase.auth.GoogleAuthProvider();
  const fbProvider = new firebase.auth.FacebookAuthProvider();


  const handleSignIn = () => {
    firebase.auth()
      .signInWithPopup(googleProvider)
      .then(result => {
        const { displayName, email, photoURL } = result.user;
        const signedInUser = {
          isSignedIn: true,
          name: displayName,
          email: email,
          photoURL: photoURL
        }
        setUser(signedInUser)
        console.log(result.user, displayName, email, photoURL)
        // const credential = result.credential
        // const token = credential.accessToken;
        // const user = result.user;

      })
      .catch(error => {
        console.log(error);
        console.log(error.message);
      })
  }
  const handleSignOut = () => {
    firebase.auth().signOut()
      .then(response => {
        const signedOutUser = {
          isSignedIn: false,
          name: '',
          email: '',
          password: '',
          photoURL: '',
          error: '',
          success: ''
        }
        setUser(signedOutUser);
      })

      .catch(error => console.log(error.message))
    console.log("sign out clicked");

  }
  const handleBlur = (event) => {
    // console.log(event.target.name, event.target.value);
    let isFieldValid = true;
    if (event.target.name === "email") {
      isFieldValid = /\S+@\S+\.\S+/.test(event.target.value);
      //  console.log(isFieldValid);
    }
    if (event.target.name === "password") {
      const isPasswordValid = event.target.value.length > 5;
      const isContainNumber = /\d{1}/.test(event.target.value)
      isFieldValid = isPasswordValid && isContainNumber;
      // console.log(isFieldValid);
    }
    if (isFieldValid) {

      const newUserInfo = { ...user };
      newUserInfo[event.target.name] = event.target.value;
      setUser(newUserInfo);
    }
  }
  const handleSubmit = (event) => {

    if (newUser && user.email && user.password) {
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
        .then(response => {
          const newUserInfo = { ...user };
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo);
          updateUserName(user.name)
        })
        .catch((error) => {
          const newUserInfo = { ...user };
          newUserInfo.success = false
          newUserInfo.error = error.message;
          setUser(newUserInfo);
        });
    }
    if (!newUser && user.email && user.password) {
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then((response) => {
          const newUserInfo = { ...user };
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo);
          console.log("sign in user info", response.user);

        })
        .catch((error) => {
          const newUserInfo = { ...user };
          newUserInfo.success = false
          newUserInfo.error = error.message;
          setUser(newUserInfo);
        });
    }
    event.preventDefault();

  }
  const updateUserName = (name) => {
    const user = firebase.auth().currentUser;
    user.updateProfile({
      displayName: name,
    }).then(response => {
      console.log('user name updated successfully');
    }).catch((error) => {
      console.log(error);
    });

  }
  const handleFbSignIn = () => {
    firebase
      .auth()
      .signInWithPopup(fbProvider)
      .then((result) => {
        /** @type {firebase.auth.OAuthCredential} */
        var credential = result.credential;

        // The signed-in user info.
        var user = result.user;

        // This gives you a Facebook Access Token. You can use it to access the Facebook API.
        var accessToken = credential.accessToken;
        console.log("fb user after sign in", user);
        // ...
      })
      .catch((error) => {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        console.log(error);

        // ...
      });
  }

  return (
    <div className='main'>
      {
        user.isSignedIn ? <button onClick={handleSignOut}>Sign Out</button> : <button onClick={handleSignIn}>Sign In with Google</button>
      }
      <br />
      <button onClick={handleFbSignIn}>Sign in with Facebook</button>
      {
        user.isSignedIn && <div>
          <img src={user.photoURL} alt="" />
          <h1>Welcome, {user.name}</h1>
          <h3>E-mail: {user.email}</h3>
        </div>
      }
      <br />
      <h1>Our Own Authentication</h1>

      <input type="checkbox" onChange={() => setNewUser(!newUser)} name="newUser" id="" />
      <label htmlFor="newUser">New User Sign up</label>
      <form onSubmit={handleSubmit}>

        {
          newUser && <div><input type="text" name="name" onBlur={handleBlur} placeholder="Your Name" /><br /></div>
        }
        <br />
        <input type="email" name='email' onBlur={handleBlur} placeholder="Input your E-mail" required />
        <br /><br />
        <input type="password" name='password' onBlur={handleBlur} placeholder="Input your Password" required />
        <br />
        <input type="submit" value={newUser ? 'Sign up' : 'Sign in'} />
      </form>
      {
        user.success && <p style={{ color: "green" }}> Account {newUser ? 'created' : 'logged in'} successfully.</p>
      }

    </div>
  );
}

export default App;
