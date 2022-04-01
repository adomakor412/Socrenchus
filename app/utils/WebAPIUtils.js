/*global fetch*/

class WebAPIUtils {
  
  constructor() {
    this.loginQueue = [];
    this.credentials = {};
  }

  authenticate(credentials, fcm_token) {
    let {access_token} = credentials;
    this.credentials = {facebook: access_token};
    return fetch('http://' + this.serverUrl + '/login', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'authorization': `Bearer ${access_token}`
      },
      body: JSON.stringify({ fcm_token })
    }).then(req => req.json()).then(({jwt}) => {
      this.credentials['jwt'] = jwt;
      this.loginQueue.forEach((fn) => fn());
      this.loginQueue = [];
      return jwt;
    });
  }
  
  try_without_login(fcm_token) {
    return fetch('http://' + this.serverUrl + '/try_without_login', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fcm_token })
    }).then(req => req.json()).then(({jwt, error}) => {
      if (error) throw new Error(error);
      this.credentials['jwt'] = jwt;
      this.loginQueue.forEach((fn) => fn());
      this.loginQueue = [];
      return jwt;
    });
  }

  update_location(location) {
    return this.ensure_login(() => {
      const access_token = this.getCredentials('jwt');
      return fetch('http://' + this.serverUrl + '/location', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'authorization': `JWT ${access_token}`
        },
        body: JSON.stringify({location})
      });
    })
  }
  
  update_fcm_token(token) {
    this.credentials['fcm'] = token;
    this.ensure_login(() => {
      const access_token = this.getCredentials('jwt')
      return fetch('http://' + this.serverUrl + '/fcm', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'authorization': `JWT ${access_token}`
        },
        body: JSON.stringify({token})
      });
    });
  }
  
  ensure_login(callback) {
    return new Promise((resolve) => {
      if ('jwt' in this.credentials) return resolve(callback());
      this.loginQueue.push(() => resolve(callback()));
    });
  }

  graphql(query, variables) {
    return fetch('http://' + this.serverUrl + '/graphql', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'authorization': `JWT ${this.getCredentials('jwt')}`
      },
      body: JSON.stringify({ query, variables })
    }).then((response) => response.json());
  }
  
  getCredentials(type) {
    if (!this.credentials) return;
    if (type) {
      return this.credentials[type];
    } else {
      return this.credentials;
    }
  }

  setServerUrl(newServerUrl) {
    this.serverUrl = newServerUrl;
  }
}
module.exports = new WebAPIUtils();