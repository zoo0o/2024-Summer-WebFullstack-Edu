var express = require("express");
var router = express.Router();

//db객체 참조하기
var db = require("../models/index");

//동적 SQL쿼리를 직접 작성해서 전달하기 위한 참조
var sequelize = db.sequelize;
const { QueryTypes } = sequelize;

//OpenAI API 호출을 위한 axios 패키지 참조하기
const axios = require("axios");

//파일처리를 위한 filesystem 내장객체 참조하기
const fs = require("fs");

//OpenAI 객체 생성하기
const { OpenAI } = require("openai");
const openai = new OpenAI({
  apikey: process.env.OPENAI_API_KEY,
});

/*
-OpenAI Dalle.3 API를 호출하여 프론트엔드에서 제공한 프롬프트기반 이미지 생성 API
-호출주소: http://localhost:5000/api/openai/dalle
-호출방식: POST
-응답결과: 생성된 이미지 JSON 데이터 반환
*/
router.post("/dalle", async (req, res) => {
  let apiResult = {
    code: 400,
    data: null,
    msg: "",
  };

  try {
    //Step1:프론트엔드에서 전달된 사용자 프롬프트 정보 추출하기
    const model = req.body.model;
    const prompt = req.body.prompt;

    //Step2:OpenAI Dalle API 호출하기
    const response = await openai.images.generate({
      model: model, //이미지처리모델선택: dall-e-2 or dall-e-3
      prompt: prompt, //사용자 프롬프트
      n: 1, //이미지 생성갯수(dalle2는최대 10개,dalle3는 1개)
      size: "1024x1024", //dalle2: 256x258,512x512,1024x1024 dall3:1024x1024,1792x1024,1024x1792 지원
      style: "vivid", //기본값:vivid, natural:dalle3만지원-더자연스럽고 초현실적인 이미지생성
      response_format: "b64_json", //url:openai사이트에 생성된 이미지 풀주소경로반환, b64_json : 바이너리 데이터 형식으로 반환
    });

    //Step3: Dalle API 호출결과에서 물리적 이미지 생성/서버공간에 저장하기
    //이미지 경로를 이용해 물리적 이미지 파일 생성하기
    const imgFileName = `sample-${Date.now()}.png`;
    const imgFilePath = `./public/ai/${imgFileName}`;

    //이미지생성요청에 대한 응답값으로 이미지 바이너리 데이터로 반환후 서버에 이미지 파일 생성하기
    const imageBinaryData = response.data[0].b64_json;
    console.log("이미지 바이너리 데이터정보:", imageBinaryData);

    const buffer = Buffer.from(imageBinaryData, "base64");
    fs.writeFileSync(imgFilePath, buffer);

    //Step4: 최종 생성된 이미지 데이터 추출하기
    const article = {
      board_type_code: 3,
      title: model,
      contents: prompt,
      article_type_code: 0,
      view_count: 0,
      ip_address:
        req.headers["x-forwarded-for"] || req.connection.remoteAddress,
      is_display_code: 1,
      reg_date: Date.now(),
      reg_member_id: 4, //추후 jwt토큰에서 사용자 고유번호 추출하여 처리
    };

    //신규 등록된 게시글 정보를 반환받는다.
    const registedArticle = await db.Article.create(article);

    //생성된 이미지 정보 만들고 저장하기
    //도메인주소를 포함한 백엔드 이미지 전체 url경로
    const imageFullPath = `${process.env.DALLE_IMG_DOMAIN}/ai/${imgFileName}`;

    const articleFile = {
      article_id: registedArticle.article_id,
      file_name: imgFileName,
      file_size: 0,
      file_path: imageFullPath,
      file_type: "PNG",
      reg_date: Date.now(),
      reg_member_id: 4,
    };

    //Step5: DB 게시글 테이블에 사용자 이미지 생성요청 정보 등록처리하기
    const file = await db.ArticleFile.create(articleFile);

    // //단일 생성 이미지 파일 정보 생성하기
    // const fileData = {
    //   article_id: registedArticle.article_id,
    //   file_id: file.article_file_id,
    //   title: registedArticle.title,
    //   contents: registedArticle.contents,
    //   file_path: file.file_path,
    //   file_name: file.file_name,
    //   reg_member_id: 4,
    //   reg_member_name: "eddy",
    // };

    //Step6: 최종 생성된 이미지 정보를 프론트엔드로 반환하기
    apiResult.code = 200;
    apiResult.data = imageFullPath;
    apiResult.msg = "Ok";
  } catch (err) {
    apiResult.code = 500;
    apiResult.data = null;
    apiResult.msg = "Server Error Failed";
  }

  //최종 처리결과값을 프론트엔드로 반환합니다.
  res.json(apiResult);
});

/*
-기 생성된 이미지 목록정보 조회요청 및 응답처리 API 라우팅 메소드
-호출주소: http://localhost:5000/api/openai/all
-호출방식: GET
-응답결과: 게시판 유형3(생성형 이미지정보)인 게시글/파일정보 조회 반환
*/
router.get("/all", async (req, res) => {
  let apiResult = {
    code: 400,
    data: null,
    msg: "",
  };

  try {
    const query = `SELECT 
                    A.article_id,
                    A.title,
                    A.contents,
                    A.reg_member_id,
                    F.article_file_id as file_id,
                    F.file_name,
                    F.file_path,
                    M.name as reg_member_name
                    From article A INNER JOIN article_file F ON A.article_id  = F.article_id
                    INNER JOIN member M ON A.reg_member_id = M.member_id
                    WHERE A.board_type_code = 3;`;

    const blogFiles = await sequelize.query(query, {
      raw: true,
      type: QueryTypes.SELECT,
    });

    apiResult.code = 200;
    apiResult.data = blogFiles;
    apiResult.msg = "Ok";
  } catch (err) {
    apiResult.code = 500;
    apiResult.data = null;
    apiResult.msg = "Server Error Failed";
  }

  res.json(apiResult);
});

/*
-ChatGPT-4o기반 질의/응답처리 API 라우팅 메소드
-호출주소: http://localhost:5000/api/openai/gpt
-호출방식: POST
-응답결과: ChatGPT 응답 메시지결과 
*/
router.post("/gpt", async (req, res) => {
  let apiResult = {
    code: 400,
    data: null,
    msg: "",
  };

  try {
    //Step1: 프론트엔드에서 전달해주는 사용자 메시지 추출하기
    const prompt = req.body.prompt;

    //Step2: OpenAI ChatGPT REST API 호출하기
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o", //지원LLM모델명:gpt-3.5-turbo,gpt-4,gpt-4o,gpt-4o-mini
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    //Step3: ChatGpt 응답메시지 반환받기
    const gptMessage = response.data.choices[0].message.content;

    apiResult.code = 200;
    apiResult.data = gptMessage;
    apiResult.msg = "Ok";
  } catch (err) {
    apiResult.code = 500;
    apiResult.data = null;
    apiResult.msg = "Server Error Failed";
  }

  res.json(apiResult);
});

module.exports = router;
