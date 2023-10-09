const express = require('express');
const fetchAndAnalyzeBlogs = require('./middleware/analyse');
const _ = require('lodash');

const app = express();
app.use(express.json());

// Route to fetch and analyse blogs
app.get('/blog-stats', fetchAndAnalyzeBlogs, (req, res) => {
  const { totalBlogs, blogWithLongestTitle,numberOfBlogsWithPrivacyTitle, uniqueBlogTitles } = req.analytics;
  res.json({
    totalBlogs,
    longestTitleBlog:blogWithLongestTitle.title,
    numberOfBlogsWithPrivacyTitle,
    uniqueBlogTitles
  });
});

// Route to search blogs by title
app.get('/blog-search', fetchAndAnalyzeBlogs, (req, res) => {
  const { query } = req.query;
  const blogData = req.blogData;

  // Perform a case-insensitive search for the query in blog titles
  const searchResults = _.filter(blogData, (blog) =>
    _.includes(_.toLower(blog.title), _.toLower(query))
  );

  res.json(searchResults);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
