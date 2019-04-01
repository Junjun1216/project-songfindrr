import axios from 'axios';
import Promise from 'bluebird';

export const get = (endpoint, params) => {
    
    return new Promise(function(resolve, reject){

        axios.get(endpoint, { params: { 'Content-Type': 'application/json', 'cleanAuthor': params.cleanAuthor, 'cleanTitle': params.cleanTitle}})
            .then((response) => {
                resolve(response);     
            })
            .catch((error) => {
                reject(error); 
            })   
    });        
}

export const post = (endpoint, params) => {
    
    return new Promise(function(resolve, reject){
        axios.post(endpoint, params)
            .then((response) => {
                resolve(response);     
            })
            .catch((error) => {
                reject(error); 
            })   
    });        
}

export const searchApi = (endpoint, params) => {
    
    return new Promise(function(resolve, reject){

        let headers = null;
        headers = {
            headers: {
                'Content-Type': 'application/json',
                'query': params.query
            }
        };
                        
        axios.post(endpoint, params, headers)
            .then((response) => {
                resolve(response);     
            })
            .catch((error) => {
                reject(error); 
            })   
    });        
}

export const fetchApi = (endpoint, params) => {
    
    return new Promise(function(resolve, reject){

        let headers = null;
        headers = {
            headers: {
                'Content-Type': 'application/json',
                'cleanAuthor': params.cleanAuthor,
                'cleanTitle': params.cleanTitle
            }
        };
                        
        axios.post(endpoint, params, headers)
            .then((response) => {
                resolve(response);     
            })
            .catch((error) => {
                reject(error); 
            })   
    });        
}

