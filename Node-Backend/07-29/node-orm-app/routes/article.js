//article.js 라우터 파일의 기본 주소는
//app.js에서 참조시 http://localhost:3000/article 기본 주소가 설정되게
//처리합니다.
var express = require('express');
var router = express.Router();

//DB 프로그래밍을 위한 ORM DB 객체 참조하기
var db = require('../models/index')


//게시글 전체 목록 조회 웹페이지 요청과 응답처리 라우팅 메소드
//호출 주소 : http://localhost:3000/article/list
//호출 방식 : GET
//응답 결과 : 전체 게시글 목록이 포함된 웹페이지 반환
router.get('/list', async(req, res)=>{
   
   //전체 게시글 목록 조회하기
   const articles = await db.Article.findAll();

   res.render('article/list.ejs', {articles});
});



//신규 게시글 등록 웹페이지 요청과 응답처리 라우팅 메소드
//호출 주소 : http://localhost:3000/article/create
router.get('/create', async(req, res)=>{
   res.render('article/create.ejs');   //view 페이지를 반환
});

//신규 게시글 입력 정보 등록 처리 요청과 응답처리 라우팅 메소드
router.post('/create', async(req, res)=>{

   //Step1 : 신규 게시글 등록 폼에서 사용자가 입력/선택한 값을 추출하자.
   const title = req.body.title;
   const contents = req.body.contents;
   const display_code = req.body.display;

   //Step2 : article 테이블에 등록할 json 데이터 생성하기
   //주요/주의 : 반드시 json 데이터 속성명은 article.js 모델의 속성명과 일치해야한다.
   const article = {
      board_type_code:1,
      title:title,
      article_type_code:0,
      contents:contents,
      view_count:0,
      ip_address:'123.111.111.111',
      is_display_code:1,
      reg_date:Date.now(),
      reg_member_id:1
   }

   //Step3 : 준비된 시규 게시글 데이터를 article 테이블에 저장한다.
   //create() 메소드는 ORM Framework에 의해 INSERT INTO article()values()쿼리로 변환되어
   //DB서버에 전송되어 DB서버에서 실행되고 실제 저장된 단일게시글 DATA를 DB서버에서 반환한다.
   const registedArticle = await db.Article.create(article)

   //신규 게시글 db 등록 처리 후
   //목록 페이지로 이동
   res.redirect('/article/list');      //페이지를 이동시킴
});




//기존 단일 게시글 수정 처리 요청과 응답 처리 라우팅 메소드
//호출 주소 : http://localhost:3000/article/modify
router.post('/modify', async(req, res)=>{

    //STEP1: 사용자 수정한 데이터를 추출한다.
    //게시글 고유번호 추출하기 
    const articleIdx = req.body.article_id; //html Hidden tag에서 추출한다. 

    const title = req.body.title;
    const contents = req.body.contents;
    const display_code = req.body.display;

    //STEP2: 수정할 JSON 데이터를 생성합니다.
    //주의:중요: 수정할 컬럼과 값만 지정하고 컬럼의 속성은 article.js모델의 속성명과 일치해야한다.

    const article = {
        title,
        contents,
        is_display_code:display_code,
        ip_address:"222.222.222.222",
        edit_date:Date.now(),
        edit_member_id:1,
    };

    //수정된 데이터 건수 결과값으로 전달됩니다.
    const updatedCnt = await db.Article.update(article,{where:{article_id:articleIdx}});
   //기존 게시글 db 수정 처리 후
   // 목록 페이지로 이동
   res.redirect('/article/list');
});



//기존 단일 게시글 삭제 처리 요청과 응답 처리 라우팅 메소드
//호출 주소 : http://localhost:3000/article/delete
router.get('/delete', async(req, res)=>{
   //기존 게시글 db 삭제 처리 후
   // 목록 페이지로 이동
   res.redirect('/article/list');
});


//신규 단일 게시글 정보 조회 확인 웹페이지 요청과 응답처리 라우팅 메소드
//호출 주소 : http://localhost:3000/article/modify/1
router.get('/modify/:id', async(req, res)=>{

   //Step1 : 현재 게시글 고유번호를 추출한다.
   const articleIdx = req.params.id;

   //Step2 : 해당 게시글 번호를 기준으로 단일 게시글 정보를 조회한다.
   //SELECT * FROM article WHERE article_id = 1; SQL구문이 백엔드에서 만들어져서
   //DB
   const article = await db.Article.findOne({where:{article_id:articleIdx}})

   //db 에서 해당 게시글 번호와 일치하는 단일 게시글 정보 조회
   res.render('article/modify.ejs');
});

module.exports = router;