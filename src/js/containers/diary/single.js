import { connect } from 'react-redux';
import { apiFetchIfNeeded } from '../../actions/api_actions';
import SingleContainer from '../../components/single__container';

const mapStateToProps = (state, ownProps) => {
  const { slug } = ownProps.match.params;
  const { apiCalls } = state;
  const list = apiCalls['diary/posts'] || {
    isFetching: true,
    items: [],
  };

  let item = {
    id: 0,
    slug: '',
    title: 'Loading',
    text: 'Loading',
    tags: [],
  };

  var i = 0;
  for (i; i < list.items.length; i++) {
    if (list.items[i].slug === slug) {
      item = list.items[i];
      break;
    }
  }

  const tags = item.tags || [];
  const isFetching = list.isFetching;

  const meta_title = item.title;
  const meta_description = item.text;

  return {
    id: 'logs',
    title: item.title,
    isFetching,
    item: item,
    tags: tags,

    meta_title: meta_title,
    meta_description: meta_description,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  dispatch(apiFetchIfNeeded('diary/posts'));
  return {};
};

const DiarySingle = connect(mapStateToProps, mapDispatchToProps)(
  SingleContainer
);

export default DiarySingle;
