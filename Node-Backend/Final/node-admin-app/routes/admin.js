var express = require('express');
var router = express.Router();

router.get('/list', function(req, res, next) {
    res.render('admin/list');
});

router.get('/create', function(req, res, next) {
    res.render('admin/create');
});
  
router.post('/create', function(req, res, next) {

    const id = req.body.id;
    const pw = req.body.pw;
    const code = req.body.code;

    res.redirect('/admin/list');
});

router.post('/modify', function(req, res, next) {

    const id = req.body.id;
    const pw = req.body.pw;
    const code = req.body.code;
    
    res.redirect('/admin/list');
});

router.get('/delete', function(req, res, next) {
    res.redirect('/admin/list');
});

router.get('/modify/:id', function(req, res, next) {
    res.render('admin/modify');
});


module.exports = router;