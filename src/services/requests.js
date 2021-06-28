import axios from 'axios';
import _ from 'lodash';
import swal from 'sweetalert';
import config from '../config.json';

const req = axios.create({
    baseURL: config.baseURL
});

const R = function (config = {}) {
    let { basepoint, endpoint, method, data } = config;
    method = _.lowerCase(method);
    let options = {
        headers: {
            'x-access-token': localStorage.getItem('accessToken'),
            'x-refresh-token': localStorage.getItem('refreshToken'),
            'x-socket-id': localStorage.getItem('socketid')
        }
    }
    if (method === 'post' || method === 'put') {
        return req[method](`${basepoint}/${endpoint}`, data, options).then(successHandler).catch(errorHandler);
    } else {
        return req[method](`${basepoint}/${endpoint}`, {
            ...options,
            params: data
        }).then(successHandler).catch(errorHandler);
    }
}

const successHandler = function (res) {
    if (res.headers['x-access-token'] && res.headers['x-refresh-token']) {
        localStorage.setItem('accessToken', res.headers['x-access-token']);
        localStorage.setItem('refreshToken', res.headers['x-refresh-token']);
    }
    if (res.status === 200) {
        // if (!res.data.status) {
        //     throw new Error(res.data.message);
        // } else {
        //     return res.data;
        // }
        return res.data;
    } else {
        throw new Error(res.data.message);
    }
}

const errorHandler = function (err) {
    swal('Server Error', err.toString(), 'error').then(() => {
        window.location.reload();
    });
}

export const Public = {

    basepoint: '/public',

    login: function (data) {
        return R({
            basepoint: this.basepoint,
            endpoint: 'login',
            method: 'POST',
            data
        }).then((res) => {
            if (res.status) {
                // if (res.data.user.type === 'Administrator') {
                    localStorage.setItem('accessToken', res.data.token);
                    localStorage.setItem('refreshToken', res.data.refreshToken);
                // } else {
                //     res.status = false;
                // }
            }
            return res;
        });
    },

    check: function () {
        return R({
            basepoint: this.basepoint,
            endpoint: `check?t=${(new Date()).getTime()}`,
            method: 'GET'
        });
    },

    logout: function () {
        return R({
            basepoint: this.basepoint,
            endpoint: 'logout',
            method: 'GET'
        }).then((res) => {
            localStorage.setItem('accessToken', null);
            localStorage.setItem('refreshToken', null);
            return res;
        })
    },

    change_password: function(data) {
        return R({
            basepoint: this.basepoint,
            endpoint: 'change_password',
            method: 'POST',
            data
        });
    },

    register: function(data) {
        return R({
            basepoint: this.basepoint,
            endpoint: 'register',
            method: 'POST',
            data
        });
    }

};


export const Site = {

    basepoint: '/sites',

    index: function () {
        return R({
            basepoint: this.basepoint,
            endpoint: '/',
            method: 'GET'
        });
    },

    save: function (data) {
        return R({
            basepoint: this.basepoint,
            endpoint: '/',
            method: 'POST',
            data
        });
    },

    edit: function (data) {
        return R({
            basepoint: this.basepoint,
            endpoint: `/${data.id}`,
            method: 'PUT',
            data
        });
    },

    delete: function (id) {
        return R({
            basepoint: this.basepoint,
            endpoint: `${id}`,
            method: 'DELETE'
        });
    },

    export: function(id, query) {
        return R({
            basepoint: this.basepoint,
            endpoint: `export/${id}?attributes=${query.attributes.join(',')}&style=${query.style}&content=${query.content}`,
            method: 'GET'
        });
    }

}

export const User = {

    basepoint: '/users',

    index: function (limit = 5, offset = 0) {
        return R({
            basepoint: this.basepoint,
            endpoint: `/?limit=${limit}&offset=${offset}`,
            method: 'GET'
        });
    },

    save: function (data) {
        return R({
            basepoint: this.basepoint,
            endpoint: '/',
            method: 'POST',
            data
        });
    },

    edit: function (id, data) {
        return R({
            basepoint: this.basepoint,
            endpoint: `/${id}`,
            method: 'PUT',
            data
        });
    },

    delete: function (id) {
        return R({
            basepoint: this.basepoint,
            endpoint: `/${id}`,
            method: 'DELETE'
        });
    }

}

export const Rent = {

    basepoint: '/rents',

    index: function (limit = 20, offset = 0) {
        return R({
            basepoint: this.basepoint,
            endpoint: `/?limit=${limit}&offset=${offset}`,
            method: 'GET'
        });
    },

    one: function(id) {
        return R({
            basepoint: this.basepoint,
            endpoint: `/${id}`,
            method: 'GET'
        });
    },

    save: function(data) {
        return R({
            basepoint: this.basepoint,
            endpoint: '/',
            method: 'POST',
            data
        });
    },

    edit: function(id, data) {
        return R({
            basepoint: this.basepoint,
            endpoint: `/${id}`,
            method: 'PUT',
            data
        });
    },

    delete: function(id) {
        return R({
            basepoint: this.basepoint,
            endpoint: `/${id}`,
            method: 'DELETE'
        });
    }

}