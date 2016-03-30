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
              dispatch(apiResponse(json, endPoint))
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

export const FILE_REQUEST  = 'FILE_REQUEST ';
function fileRequest(endPoint) {
    return {
        type: FILE_REQUEST ,
        endPoint
    };
}


export const FILE_RESPONSE = 'FILE_RESPONSE';
export function fileResponse(text, endPoint) {
    return {
        type: FILE_RESPONSE,
        endPoint,
        file: text,
        receivedAt: Date.now()
    };
}

export function fileFetch(endPoint) {
    return function (dispatch) {
        dispatch(fileRequest(endPoint));
        return fetch(endPoint)
        .then(response => response.text())
        .then(text =>
              dispatch(fileResponse(text, endPoint))
             );
    };
}

export function fileFetchIfNeeded(endPoint){
    // Note that the function also receives getState()
    // which lets you choose what to dispatch next.

    // This is useful for avoiding a network request if
    // a cached value is already available.

    return (dispatch, getState) => {
        if (fileShouldFetch(getState(), endPoint)) {
            // Dispatch a thunk from thunk!
            return dispatch(fileFetch(endPoint));
        } else {
            // Let the calling code know there's nothing to wait for.
            return Promise.resolve();
        }
    };
}

function fileShouldFetch(state, endPoint) {
    const fileCall = state.fileCalls[endPoint];
    if (!fileCall) {
        return true;
    } else if (fileCall.isFetching) {
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
import { fileFetchIfNeeded } from '../actions/actions';
import  About from '../components/about.jsx';;

const mapStateToProps = (state, ownProps) => {
    const { fileCalls } = state;
    const {
        isFetchingAbout,
        file: about
    } = fileCalls['https://raw.githubusercontent.com/Arlefreak/Resume/master/About.md'] || {
        isFetchingAbout: true,
        about: ''
    };

    const {
        isFetchingSite,
        file: site
    } = fileCalls['https://raw.githubusercontent.com/Arlefreak/arlefreakClient/master/README.md'] || {
        isFetchingSite: true,
        site: ''
    };

    const isFetching = isFetchingAbout && isFetchingSite;

    return {
        about: about,
        site: site,
        isFetching
    };
};

const mapDispatchToProps = (dispatch) => {
    dispatch(fileFetchIfNeeded('https://raw.githubusercontent.com/Arlefreak/Resume/master/About.md'));
    dispatch(fileFetchIfNeeded('https://raw.githubusercontent.com/Arlefreak/arlefreakClient/master/README.md'));
    return {};
};

const AboutV = connect(
    mapStateToProps,
    mapDispatchToProps
)(About);

export default AboutV;

import { connect } from 'react-redux';
import { fileFetchIfNeeded } from '../actions/actions';
import  CV from '../components/cv.jsx';;

const mapStateToProps = (state, ownProps) => {
    const { fileCalls } = state;
    const {
        isFetching,
        lastUpdated,
        file: file
    } = fileCalls['https://raw.githubusercontent.com/Arlefreak/Resume/master/README.md'] || {
        isFetching: true,
        file: ''
    };

    return {
        file: file,
        isFetching
    };
};

const mapDispatchToProps = (dispatch) => {
    dispatch(fileFetchIfNeeded('https://raw.githubusercontent.com/Arlefreak/Resume/master/README.md'));
    return {};
};

const cv = connect(
    mapStateToProps,
    mapDispatchToProps
)(CV);

export default cv;

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
import { setCategoryFilter, filterProjects, apiFetchIfNeeded } from '../actions/actions';
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
    dispatch(apiFetchIfNeeded('projectsCategories'));
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
import DiaryList from '../components/diaryList.jsx';

const mapStateToProps = (state) => {
    const { apiCalls } = state;
    const {
        isFetching,
        lastUpdated,
        items: items
    } = apiCalls['posts'] || {
        isFetching: true,
        items: []
    };

    return {
        posts: items,
        isFetching,
        lastUpdated
    };
};

const mapDispatchToProps = (dispatch) => {
    dispatch(apiFetchIfNeeded('posts'));
    return {};
};

const Diary = connect(
    mapStateToProps,
    mapDispatchToProps
)(DiaryList);

export default Diary;

import { connect } from 'react-redux';
import  Diary from '../components/diarySingle.jsx';;
import { apiFetchIfNeeded } from '../actions/actions';

const mapStateToProps = (state, ownProps) => {
    const { id } = ownProps.params;
    const { apiCalls } = state;
    const posts = apiCalls['posts'] || {
        isFetching: true,
        items: []
    };

    let post = {
        id: 0,
        title: 'not',
        text: 'not'
    };
    var i = 0;
    for(i; i < posts.items.length; i++){
        if (posts.items[i].id === parseInt(id)){
            post = posts.items[i];
            break;
        }
    }
    const isFetching = posts.isFetching;
    return {
        isFetching: isFetching,
        post: post
    };
};

const DiaryV = connect(
    mapStateToProps
)(Diary);

export default DiaryV;

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
    } = apiCalls['projectsImages/?imgType=mni'] || {
        isFetching: true,
        items: []
    };
    
    const {
        items: projects
    } = apiCalls['projects'] || {
        items: []
    };

    let filterProjects = visibleProjects;
    if(visibleProjects.length === 0 && tagFilter.length === 0 && categoryFilter.id === 0){
        filterProjects = projects;
    }
    const filteredImages = getVisibleImages(items, filterProjects);

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
import { apiFetchIfNeeded } from '../actions/actions';

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

const mapDispatchToProps = (dispatch) => {
    dispatch(apiFetchIfNeeded('projects'));
    dispatch(apiFetchIfNeeded('projectsImages/?imgType=mni'));
    return {};
};

const Portfolio = connect(
    mapStateToProps,
    mapDispatchToProps
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

    let project = {
        id: 0,
        name: '',
        description: '',
        tags: []
    };
    var i = 0;
    for(i; i < projects.items.length; i++){
        if (projects.items[i].id === parseInt(id)){
            project = projects.items[i];
            break;
        }
    }
    const links = apiCalls['projectsLinks/?project__id=' + id] || {
        isFetching: true,
        items: []
    };
    const images = apiCalls['projectsImages?imgType=gal&project__id=' + id] || {
        isFetching: true,
        items: []
    };
    const isFetching = projects.isFetching && images.isFetching && links.isFetching;
    return {
        isFetching: isFetching,
        project: project,
        links: links,
        images: images
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    const { id } = ownProps.params;
    dispatch(apiFetchIfNeeded('projects'));
    dispatch(apiFetchIfNeeded('projectsLinks/?project__id=' + id));
    dispatch(apiFetchIfNeeded('projectsImages?imgType=gal&project__id=' + id));
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
import { addTagFilter, clearTagFilter, filterProjects } from '../actions/actions';
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
import { apiFetchIfNeeded } from '../actions/actions';

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
    dispatch(apiFetchIfNeeded('tags'));
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

   
    let filterProjects = visibleProjects;
    if(visibleProjects.length === 0 && tagFilter.length === 0 && categoryFilter.id === 0){
        filterProjects = items;
    }

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
import { SET_VISIBLE_PROJECTS, FILE_REQUEST, FILE_RESPONSE, API_REQUEST, API_RESPONSE, SET_CATEGORY_FILTER, ADD_TAG_FILTER, DELETE_TAG_FILTER, CLEAR_ALL_TAG_FILTERS } from '../actions/actions';

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

function fileCalls(state = {}, action) {
    switch (action.type) {
        case FILE_RESPONSE:
            return Object.assign({}, state, {
                [action.endPoint]: file(state[action.endPoint], action)
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


const file = (state = {
    isFetching: false,
    file: ''
}, action) => {
    switch (action.type) {
        case FILE_REQUEST:
            return Object.assign({}, state, {
                isFetching: true
            });
        case FILE_RESPONSE:
            return Object.assign({}, state, {
                isFetching: false,
                file: action.file,
                lastUpdated: action.receivedAt
            });
        default:
            return state;
    }
};

const portfolioApp = combineReducers({
    tagFilter,
    apiCalls,
    fileCalls,
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
