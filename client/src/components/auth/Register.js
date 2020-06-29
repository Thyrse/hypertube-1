import React, { Fragment, useState } from 'react';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
import { setAlert } from '../../actions/alert';
import { register, registerGithub, registerFortyTwo } from '../../actions/auth';
// import { register } from '../../actions/auth';

import PropTypes from 'prop-types';

// setAlert is pulled out of props
const Register = ({
  setAlert,
  register,
  registerGithub,
  registerFortyTwo,
  isAuthenticated,
  justRegistered,
}) => {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    password: '',
    password2: '',
  });

  const {
    firstname,
    lastname,
    username,
    email,
    password,
    password2,
  } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== password2) {
      setAlert('Passwords do not match', 'danger'); // alert type is danger
    } else {
      register({ firstname, lastname, username, email, password });
    }
  };

  if (justRegistered) {
    return <Redirect to='/login' />;
  }
  if (isAuthenticated) {
    return <Redirect to='/dashboard' />;
  }
  return (
    <Fragment>
      <div className='container row mx-auto d-flex flex-column align-items-center my-4'>
        <div
          id='signup'
          className='col-9 col-md-8 col-lg-5 shadow__light px-5 py-3 my-4 mx-1 rounded'
        >
          <div className='row justify-content-center text-center my-3'>
            <h3>Create an account</h3>
          </div>
          <form
            encType='multipart/form-data'
            action='signup'
            onSubmit={(e) => onSubmit(e)}
          >
            <div className='col-12'>
              <div className='formContent'>
                <input
                  className='formContent__input'
                  id='username'
                  name='username'
                  type='text'
                  value={username}
                  onChange={(e) => onChange(e)}
                  focus-first='true'
                  required
                />
                <label className='formContent__label' htmlFor='username'>
                  <span className='formContent__label__name'>Username</span>
                </label>
              </div>
              <div className='formContent'>
                <input
                  className='formContent__input'
                  id='lastname'
                  name='lastname'
                  type='text'
                  value={lastname}
                  onChange={(e) => onChange(e)}
                  required
                />
                <label className='formContent__label' htmlFor='lastname'>
                  <span className='formContent__label__name'>Lastname</span>
                </label>
              </div>
              <div className='formContent'>
                <input
                  className='formContent__input'
                  id='firstname'
                  name='firstname'
                  type='text'
                  value={firstname}
                  onChange={(e) => onChange(e)}
                  required
                />
                <label className='formContent__label' htmlFor='firstname'>
                  <span className='formContent__label__name'>Firstname</span>
                </label>
              </div>
              <div className='formContent'>
                <input
                  className='formContent__input'
                  type='email'
                  autoComplete='off'
                  id='email-address'
                  name='email'
                  type='email'
                  value={email}
                  onChange={(e) => onChange(e)}
                  required
                />
                <label className='formContent__label' htmlFor='email-address'>
                  <span className='formContent__label__name'>E-mail</span>
                </label>
              </div>
              <div className='formContent'>
                <input
                  className='formContent__input'
                  autoComplete='off'
                  id='password'
                  name='password'
                  type='password'
                  value={password}
                  onChange={(e) => onChange(e)}
                  required
                />
                <label className='formContent__label' htmlFor='password'>
                  <span className='formContent__label__name'>Password</span>
                </label>
              </div>
              <div className='formContent'>
                <input
                  className='formContent__input'
                  autoComplete='off'
                  id='confirm-password'
                  name='password2'
                  type='password'
                  value={password2}
                  onChange={(e) => onChange(e)}
                  required
                />
                <label
                  htmlFor='confirm-password'
                  className='formContent__label'
                >
                  <span className='formContent__label__name'>
                    Confirm password
                  </span>
                </label>
              </div>
              <div className='text-center my-3'>
                <p className='text-danger' v-if="cloudError==='doublon'">
                  <small>
                    It looks like there's already an account with your email
                    address or username. Try with another credentials.
                  </small>
                </p>
                <p className='text-danger' v-else-if='cloudError'>
                  <small>
                    An error occured while processing your request. Please check
                    your informations and try again.
                  </small>
                </p>
              </div>
              <div className='text-center my-3'>
                <button type='submit' className='btn btn-primary'>
                  Create account
                </button>
              </div>
            </div>
          </form>
        </div>
        <div className='col-9 col-md-8 col-lg-5 shadow__light px-5 py-3 my-4 mx-1 rounded'>
          <div className='row justify-content-center my-3'>
            <h3>Sign up with:</h3>
          </div>
          <div className='col-12'>
            <div className='text-center mb-3'>
              <button
                className='btn btn-outline-light icon-custom icon-custom__fortytwo'
                type='button'
                onClick={() => registerFortyTwo()}
              >
                Sign up
              </button>
            </div>
            <div className='text-center mb-3'>
              <button
                className='btn btn-outline-light icon-custom icon-custom__github'
                type='button'
                onClick={() => registerGithub()}
                // onClick={() => {
                //   const xhr = new XMLHttpRequest();
                //   xhr.open('GET', '/api/auth/auth/github', true);
                //   xhr.onload = (req, res) => {
                //     console.log('loaded');
                //     if (req.status >= 200 && req.status < 400) {
                //       this.setState({ users: xhr.responseText, done: true });
                //     }
                //   };
                //   console.log('we are here');
                //   xhr.send();
                // }}
                // href='http://localhost:5000/api/auth/auth/github'
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

Register.propTypes = {
  setAlert: PropTypes.func.isRequired,
  register: PropTypes.func.isRequired,
  registerGithub: PropTypes.func.isRequired,
  registerFortyTwo: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool,
  justRegistered: PropTypes.bool,
};

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
  justRegistered: state.auth.justRegistered,
});

export default connect(mapStateToProps, {
  setAlert,
  register,
  registerGithub,
  registerFortyTwo,
})(Register);
// export default connect(mapStateToProps, { setAlert, register })(Register); // export connect with setAlert action, so it is available within props
