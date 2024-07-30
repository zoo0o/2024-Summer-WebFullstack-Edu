//서버 상의 경로를 조회하는 패키지 참조
const path = require('path');

//sequelize OMR 프레임워크 객체 참조
const Sequelize = require('sequelize');

//개발모드 환경설정
const env = process.env.NODE_ENV || 'development';

//DB연결 환경설정정보 변경처리//관련정보 수정
//__dirname은 현재 모듈(index.js)의 물리적 경로 조회
const config = require(path.join(__dirname,'..','config','config.json'))[env];

//데이터 베이스 객체
const db= {};

//DB연결정보로 시퀄라이즈 ORM 객체 생성
//소문자 sequelize 실제 DB서버에 연결하고 DB서버에 SQL구문을 전달해서 데이터를 처리하는 기능 제공
const sequelize = new Sequelize(config.database,config.username,config.password,config);

//DB 처리 객체에 시퀄라이즈 정보 맵핑처리
//이후 DB객체를 통해 데이터 관리가능해짐
db.sequelize = sequelize; //DB연결정보를 포함한 DB제어 객체속성(CRUD)
db.Sequelize = Sequelize; //Sequelize팩키지에서 제공하는 각종 데이터 타입 및 관련 객체정보를 제공함

//회원모델 모듈파일 참조하고 db속성정의하기
db.Member = require('./member.js')(sequelize,Sequelize);

//게시글 모델을 참조하고 db 객체에 Article 동적 속성을 추가합니다.
db.Article = require('./article.js')(sequelize,Sequelize);

//db객체 외부로 노출하기
module.exports = db;