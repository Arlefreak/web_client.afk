import { connect } from 'react-redux';
import { setCategoryFilter } from '../../actions/category_filter_actions';
import { apiFetchIfNeeded } from '../../actions/api_actions';
import Single from '../../components/single__container';

const mapStateToProps = (state, ownProps) => {
  const { slug } = ownProps.match.params;
  const { apiCalls } = state;
  const list = apiCalls['portfolio/projects'] || {
    isFetching: true,
    items: [],
  };

  let item = {
    id: 0,
    slug: '',
    name: '',
    description: '',
    tags: [],
  };

  var i = 0;
  for (i; i < list.items.length; i++) {
    if (list.items[i].slug === slug) {
      item = list.items[i];
      break;
    }
  }

  const links = apiCalls['portfolio/projectsLinks/?project__slug=' + slug] || {
    isFetching: true,
    items: [],
  };

  const images = apiCalls[
    'portfolio/projectsImages?imgType=gal&project__slug=' + slug
  ] || {
    isFetching: true,
    items: [],
  };

  const tags = item.tags || [];

  const isFetching =
    list.isFetching && images.isFetching && links.isFetching && tags.apiCalls;

  const meta_title = item.name;
  const meta_description = item.description;

  return {
    id: 'portfolio',
    title: item.name,
    meta_description: item.description,
    isFetching: false,
    item: item,
    links: links.items,
    images: images.items,
    tags: tags,

    meta_title,
    meta_description,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const { slug } = ownProps.match.params || '';
  dispatch(apiFetchIfNeeded('portfolio/projects'));
  dispatch(apiFetchIfNeeded('portfolio/projectsLinks/?project__slug=' + slug));
  dispatch(
    apiFetchIfNeeded(
      'portfolio/projectsImages?imgType=gal&project__slug=' + slug
    )
  );
  dispatch(apiFetchIfNeeded('portfolio/projectTags'));

  return {};
};

const Project = connect(mapStateToProps, mapDispatchToProps)(Single);

export default Project;
