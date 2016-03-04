import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/app.jsx';

var routes = React.createElement(App);
ReactDOM.render(routes, document.getElementById('application'));

const APIURL = 'http://api.arlefreak.com/';
module.exports = {
    APIURL:APIURL
};

var i = 1;
console.log(i);

import fetch from 'isomorphic-fetch';
import constants from '../constants.js';
const apiURL = constants.APIURL;

export const SET_CATEGORY_FILTER = 'SET_CATEGORY_FILTER';
export function setCategoryFilter(id, name) {
    return {
        type: SET_CATEGORY_FILTER,
        id,
        name
    };
}

export const ADD_TAG_FILTER = 'ADD_TAG_FILTER';
export const DELETE_TAG_FILTER = 'DELETE_TAG_FILTER';
export const CLEAR_ALL_TAG_FILTERS = 'CLEAR_ALL_TAG_FILTERS';

export function addTagFilter(id, name) {
    return { 
        type: ADD_TAG_FILTER,
        id,
        name
    };
}

export function deleteTagFilter(id) {
    return {
        type: DELETE_TAG_FILTER,
        id
    };
}

export function clearTagFilter() {
    return {
        type: CLEAR_ALL_TAG_FILTERS
    };
}

export const API_REQUEST = 'API_REQUEST';
function apiRequest(endPoint) {
    return {
        type: API_REQUEST,
        endPoint
    };
}


export const API_RESPONSE = 'API_RESPONSE';
export function apiResponse(json, endPoint) {
    return {
        type: API_RESPONSE,
        endPoint,
        projects: json,
        receivedAt: Date.now()
    };
}

export function apiFetch(endPoint) {
    return function (dispatch) {
        dispatch(apiRequest(endPoint));
        return fetch(apiURL + endPoint)
        .then(response => response.json())
        .then(json =>
              dispatch(apiResponse(json, endPoint)),
              dispatch(filterProjects())
             );
    };
}

export function apiFetchIfNeeded(endPoint){
    // Note that the function also receives getState()
    // which lets you choose what to dispatch next.

    // This is useful for avoiding a network request if
    // a cached value is already available.

    return (dispatch, getState) => {
        if (apiShouldFetch(getState(), endPoint)) {
            // Dispatch a thunk from thunk!
            return dispatch(apiFetch(endPoint));
        } else {
            // Let the calling code know there's nothing to wait for.
            return Promise.resolve();
        }
    };
}

function apiShouldFetch(state, endPoint) {
    const apiCall = state.apiCalls[endPoint];
    if (!apiCall) {
        return true;
    } else if (apiCall.isFetching) {
        return false;
    } else {
        return false;
    }
}

export const SET_VISIBLE_PROJECTS = 'SET_VISIBLE_PROJECTS';
export function setVisibleProjects(projects) {
    const PROJECTS = projects || [];
    return {
        type: SET_VISIBLE_PROJECTS,
        projects: projects
    };
}

export function filterProjects() {
    return function (dispatch, getState){
        const state = getState() || {};
        const apiCalls = state['apiCalls'] || [];
        const projects = apiCalls['projects'] || {};
        const items = projects.items || [];
        const categoryFilter = state['categoryFilter'];
        const tagFilter = state['tagFilter'] || [];
        let filterProjects = filterByCategory(items, categoryFilter);
        filterProjects = filterByTags(filterProjects, tagFilter);
        dispatch(setVisibleProjects(filterProjects));
    };
}

function filterByCategory (projects, category) {
    if(projects.length > 0){
        if(category.id === 0){
            return projects;
        }else{
            return projects.filter(t => t.category === category.id);
        }
    }else{
        return projects;
    }
};

function filterByTags (projects, tags) {
    var filteredProjects = [];
    var i = 0;
    var j = 0;
    var k = 0;
    var project;
    if(projects && tags){
        if(projects.length > 0 && tags.length > 0){
            for(i; i < projects.length; i++){
                project = projects[i];
                j = 0;
                if(project){
                    for(j; j < project.tags.length; j++){
                        var b = false;
                        k = 0;
                        for(k; k < tags.length; k++){
                            if(project.tags[j].id === tags[k].id){
                                filteredProjects.push(project);
                                b = true;
                                break;
                            }
                        }
                        if(b){
                            break;
                        }
                    }
                }
            }
        }else{
            filteredProjects = projects;
        }
    }else{
        filteredProjects = projects;
    }
    return filteredProjects;
};



import { connect } from 'react-redux';
import  CategoryRow from '../components/categoryRow.jsx';;

const mapStateToProps = (state, ownProps) => {
    const { apiCalls, categoryFilter } = state;
    const { category } = ownProps;
    let active = false;

    if(categoryFilter){
        if(categoryFilter.id === category.id){
            active = true;
        }
    }
    return {
        category,
        active
    };
};

const Category = connect(
    mapStateToProps
)(CategoryRow);

export default Category;

import { connect } from 'react-redux';
import { setCategoryFilter, filterProjects } from '../actions/actions';
import  CategoryList from '../components/categoryList.jsx';;

const mapStateToProps = (state, ownProps) => {
    const { apiCalls, categoryFilter } = state;
    const {
        isFetching,
        lastUpdated,
        items: categories
    } = apiCalls['projectsCategories'] || {
        isFetching: true,
        items: []
    };
    if(categories.length > 0 && categories[0].id !== 0 ){
        categories.unshift({
            id: 0,
            name:'All',
        });
    }
    return {
        categories: categories,
        isFetching,
        lastUpdated
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        onCategoryClick: (id, name) => {
            dispatch(setCategoryFilter(id, name));
            dispatch(filterProjects());
        }
    };
};

const CategoryFilter = connect(
    mapStateToProps,
    mapDispatchToProps
)(CategoryList);

export default CategoryFilter;

import { connect } from 'react-redux';
import { clearTagFilter, filterProjects } from '../actions/actions';
import TagRow from '../components/clearAllTagsRow.jsx';;

const mapStateToProps = (state, ownProps) => {
    const { apiCalls, tagFilter } = state;
    let active = false;

    if(!tagFilter){
        active = true;
    }else if(tagFilter.length === 0){
        active = true;
    }
    return {
        active
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    const { tag } = ownProps;
    return {
        onClick: () => {
            dispatch(clearTagFilter());
            dispatch(filterProjects());
        }
    };
};

const Tag = connect(
    mapStateToProps,
    mapDispatchToProps
)(TagRow);

export default Tag;

import { connect } from 'react-redux';
import { apiFetchIfNeeded } from '../actions/actions';
import  ImageList from '../components/imageList.jsx';;

const getVisibleImages  = (items, projects) => {
    if(items.length > 0){
        var i = 0;
        var j = 0;
        var filteredImages = [];
        for(i; i < items.length; i++){
            j = 0;
            for(j; j < projects.length; j++){
                if(items[i].project === projects[j].id ){
                    filteredImages.push(items[i]);
                }
            } 
        }
        return filteredImages;
    }else{
        return items;
    }
};

const mapStateToProps = (state, ownProps) => {
    const { apiCalls, visibleProjects, tagFilter, categoryFilter } = state;
    const {
        isFetching,
        lastUpdated,
        items: items
    } = apiCalls['images'] || {
        isFetching: true,
        items: []
    };

    const filteredImages = getVisibleImages(items, visibleProjects);

    return {
        images: filteredImages,
        isFetching,
        lastUpdated
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        onImageClick: (id, name) => {
            // dispatch(setCategoryFilter(id, name));
            console.log('ImageClick: ' + id);
        }
    };
};

const Images = connect(
    mapStateToProps,
    mapDispatchToProps
)(ImageList);

export default Images;

import { connect } from 'react-redux';
import PortfolioV from '../components/portfolio.jsx';

const mapStateToProps = (state) => {
    const { apiCalls } = state;
    const {
        isFetching
    } = apiCalls['projects'] || {
        isFetching: true
    };
    return {
        isFetching
    };
};

const Portfolio = connect(
    mapStateToProps
)(PortfolioV);

export default Portfolio;

import { connect } from 'react-redux';
import { setCategoryFilter } from '../actions/actions';
import  Project from '../components/project.jsx';;
import { apiFetchIfNeeded } from '../actions/actions';

const mapStateToProps = (state, ownProps) => {
    const { id } = ownProps.params;
    const { apiCalls } = state;
    const projects = apiCalls['projects'] || {
        isFetching: true,
        items: []
    };
    const project = projects.items[id] || {
        id: 0,
        name: '',
        description: '',
        tags: []
    };
    const links = apiCalls['projectsLinks/?project__id=' + id] || {
        isFetching: true,
        items: []
    };
    const images = apiCalls['images/?imgType=gal&project__id=' + id] || {
        isFetching: true,
        items: []
    };
    const isFetching = projects.isFetching && images.isFetching && links.isFetching;
    console.log(images);
    return {
        isFetching: isFetching,
        project: project,
        links: links,
        images: images
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    const { id } = ownProps.params;
    dispatch(apiFetchIfNeeded('projectsLinks/?project__id=' + id));
    dispatch(apiFetchIfNeeded('images/?imgType=gal&project__id=' + id));
    return {
        onTagClick: (id) => { console.log(id); },
        onImageClick : () => { console.log('ImageClick'); }
    };
};

const ProjectV = connect(
    mapStateToProps,
    mapDispatchToProps
)(Project);

export default ProjectV;

import { connect } from 'react-redux';
import { addTagFilter, clearTagFilter } from '../actions/actions';
import TagRow from '../components/projectTagRow.jsx';;

const mapStateToProps = (state, ownProps) => {
    const { apiCalls, tagFilter } = state;
    const { tag } = ownProps;
    let active = false;

    if(tagFilter){
        var i = 0;
        for(i; i < tagFilter.length; i++){
            if(tagFilter[i].id === tag.id){
                active = true;
            }
        }
    }
    return {
        tag,
        active
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    const { tag } = ownProps;
    return {
        onClick: () => {
            dispatch(clearTagFilter());
            dispatch(addTagFilter(tag.id, tag.name));
        }
    };
};

const Tag = connect(
    mapStateToProps,
    mapDispatchToProps
)(TagRow);

export default Tag;

import { connect } from 'react-redux';
import { addTagFilter, deleteTagFilter, filterProjects } from '../actions/actions';
import TagRow from '../components/tagRow.jsx';;

const mapStateToProps = (state, ownProps) => {
    const { apiCalls, tagFilter } = state;
    const { tag } = ownProps;
    let active = false;

    if(tagFilter){
        var i = 0;
        for(i; i < tagFilter.length; i++){
            if(tagFilter[i].id === tag.id){
                active = true;
            }
        }
    }
    return {
        tag,
        active
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    const { tag } = ownProps;
    return {
        onClick: () => {
            dispatch(addTagFilter(tag.id, tag.name));
            dispatch(filterProjects());
        }
    };
};

const Tag = connect(
    mapStateToProps,
    mapDispatchToProps
)(TagRow);

export default Tag;

import { connect } from 'react-redux';
import  TagList from '../components/tagList.jsx';;

const mapStateToProps = (state, ownProps) => {
    const { apiCalls } = state;
    const {
        isFetching,
        lastUpdated,
        items: tags
    } = apiCalls['tags'] || {
        isFetching: true,
        items: []
    };
    return {
        tags: tags,
        isFetching,
        lastUpdated
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        onTagClick: (id, name) => {
            dispatch(addTagFilter(id, name));
        }
    };
};

const TagFilter = connect(
    mapStateToProps,
    mapDispatchToProps
)(TagList);

export default TagFilter;

import { connect } from 'react-redux';
import ProjectList from '../components/projectList.jsx';
import { setVisibleProjects } from '../actions/actions.js';

const getVisibleProjects  = (items, projects) => {
    if(items.length > 0){
        var i = 0;
        var j = 0;
        var filteredImages = [];
        for(i; i < items.length; i++){
            j = 0;
            for(j; j < projects.length; j++){
                if(items[i].id === projects[j].id ){
                    filteredImages.push(items[i]);
                }
            } 
        }
        return filteredImages;
    }else{
        return items;
    }
};

const mapStateToProps = (state) => {
    const { apiCalls, visibleProjects, tagFilter, categoryFilter } = state;
    const {
        isFetching,
        lastUpdated,
        items: items
    } = apiCalls['projects'] || {
        isFetching: true,
        items: []
    };

    const filterProjects = getVisibleProjects(items, visibleProjects);

    return {
        projects: filterProjects,
        isFetching,
        lastUpdated
    };
};

const VisibleProjects = connect(
    mapStateToProps
)(ProjectList);

export default VisibleProjects;

import { combineReducers } from 'redux';
import { SET_VISIBLE_PROJECTS, API_REQUEST, API_RESPONSE, SET_CATEGORY_FILTER, ADD_TAG_FILTER, DELETE_TAG_FILTER, CLEAR_ALL_TAG_FILTERS } from '../actions/actions';

const categoryFilter = (state = {
    id: 0,
    name: 'All'
}, action) => {
    switch (action.type) {
        case SET_CATEGORY_FILTER:
            return {
                id: action.id,
                name: action.name
            };
        default:
            return state;
    }
};

const tagFilter = (state = [], action) => {
    var exists = false;
    var i = 0;
    var index = 0;
    switch (action.type) {
        case ADD_TAG_FILTER:
        case DELETE_TAG_FILTER:
            for(i; i < state.length; i++){
                if(state[i].id === action.id){
                    exists = true;
                    index = i;
                    break;
                }
            }
            if(exists){
                return [
                    ...state.slice(0, index),
                    ...state.slice(index + 1)
                ];
            }
            return [
                ...state,{
                    id: action.id,
                    name: action.name
                }
            ];
        case CLEAR_ALL_TAG_FILTERS:
            return [];
        default:
            return state;
    }
};

const visibleProjects = (state = [], action) => {
    switch (action.type){
        case SET_VISIBLE_PROJECTS:
            return action.projects;
            break;
        default:
            return state;
            break;
    }
};

function apiCalls(state = {}, action) {
    switch (action.type) {
        case API_RESPONSE:
            return Object.assign({}, state, {
                [action.endPoint]: items(state[action.endPoint], action)
            });
        default:
            return state;
    }
};

const items = (state = {
    isFetching: false,
    items: []
}, action) => {
    switch (action.type) {
        case API_REQUEST:
            return Object.assign({}, state, {
                isFetching: true
            });
        case API_RESPONSE:
            return Object.assign({}, state, {
                isFetching: false,
                items: action.projects,
                lastUpdated: action.receivedAt
            });
        default:
            return state;
    }
};

const portfolioApp = combineReducers({
    tagFilter,
    apiCalls,
    categoryFilter,
    visibleProjects
});

export default portfolioApp;

import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import { fetchPosts, addTagFilter, setCategoryFilter } from './actions/actions';
import portfolioApp from './reducers/reducers';

const loggerMiddleware = createLogger();

// const store = createStore(
//     applyMiddleware(
//         thunkMiddleware, // lets us dispatch() functions
//         loggerMiddleware // neat middleware that logs actions
//     ),
//     portfolioApp
// );

let store =  applyMiddleware(
    thunkMiddleware,
    loggerMiddleware
)(createStore)(portfolioApp);

store.dispatch(fetchPosts());
store.dispatch(addTagFilter(1, 'phaser'));
store.dispatch(setCategoryFilter(1, 'Games'));
