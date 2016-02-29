import React, { PropTypes } from 'react';
import Category from './categoryRow.jsx';

const CategoryList = ({ tags, onTagClick }) => (
    <ul>
        {
            tags.map( project =>
                     <Category
                         key={category.id}
                         {...category}
                         onClick={() => onTagClick(category.id)}
                     />
                     )}
                 </ul>
);

CategoryList.propTypes = {
    tags: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired
    }).isRequired).isRequired,
    onTagClick: PropTypes.func.isRequired
};

export default CategoryList;
