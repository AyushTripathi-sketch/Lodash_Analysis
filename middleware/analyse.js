const axios = require('axios');
const _ = require('lodash');

const API_URL = 'https://intent-kit-16.hasura.app/api/rest/blogs';
const HASURA_ADMIN_SECRET = '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6';

//cached function to store apis response for an hour
const fetchDataFromApi = _.memoize(async()=>{
    try{
        console.log("hello");
        const response = await axios.get(API_URL, {
            headers: {
            'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
            },
        });
        const blogs = response.data.blogs;
        // Calculate analytics using Lodash
        const totalBlogs = _.size(blogs);
        const blogWithLongestTitle = _.maxBy(blogs, _.property('title.length'));
        const numberOfBlogsWithPrivacyTitle = _.size(_.filter(blogs, (blog) => _.includes(blog.title.toLowerCase(), 'privacy')));
        const uniqueBlogTitles = _.uniqBy(blogs, 'title').map(blog => blog.title);
        return {analytics:{totalBlogs,blogWithLongestTitle,numberOfBlogsWithPrivacyTitle,uniqueBlogTitles},blogData:blogs};
    }catch(err){
        return err;
    }
},(req) =>{
        const time = (new Date()).getHours();    //caching period of an hour
        const cacheKey = JSON.stringify({url:req.url,time:time});
        return cacheKey;
});

// Middleware to fetch and analyze blog data
const fetchAndAnalyzeBlogs = async(req, res, next) => {
  try {
    const {analytics,blogData} = await fetchDataFromApi(req);
    req.analytics = analytics;
    req.blogData = blogData;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = fetchAndAnalyzeBlogs