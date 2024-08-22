//메시지 서버 소켓파일입니다.
//해당 socket.js 모듈이 메시징 서버 역할을 제공합니다.

//socket.io 팩키지 참조
const SocketIO = require("socket.io");

//db객체 참조하기
var db = require("./models/index");

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

//socket.js모듈 기능정의
module.exports = (server) => {
  //서버 소켓의 입출력(In/Out) 메시지 처리 객체 io 생성
  //input 메시지는 웹브라우저에서 들어오는 메시지
  //output 메시지는 서버소켓에서 웹브라우저로 전송하는 메시지
  // const io = SocketIO(server,{path:"/socket.io"});

  //서버소켓에 대한 CORS 이슈 해결하기
  //서버소켓객체 io: 서버소켓과연결된 모든 사용자제어가능
  const io = SocketIO(server, {
    path: "/socket.io",
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  //자바스크립트에서 on(이벤트핸들러(처리기))
  //io객체에 connection 이벤트가 발생하면 콜백함수를 실행해라.
  //connection 이벤트는 웹브라우저와 서버소켓과 연결이 완료되면 발생합니다.
  //socket객체는 개별 사용자/그룹사용자 단위의 메시지 처리를 담당하는 객체..
  io.on("connection", (socket) => {
    //socket은 현재 연결된 사용자(웹브라우저) 서버소켓간 연결 객체
    //웹브라우저에서 서버소켓에 broadcast라는 이벤트 수신기를 호출하면 관련 콜백함수가 실행된다.
    //socket.on("서버소켓 이벤트 수신기명",처리할콜백함수):

    //웹브라우저(클라이언트/프론트엔드)에서 서버소켓에 broadcast라는 이벤트를 호출하면
    //서버소켓에서 클라이언트에서 보내준 메시지를 수신하고 콜백함수를 통해
    //서버에서 클라이언트로 메시지를 전송(io.emit())한다.
    socket.on("broadcast", function (msg) {
      //현재 메시지 서버에 연결된 모든 사용자들(웹브라우저/프론트엔드웹페이지)에게
      //메시지를 전송하는데 클라이언트 메시지 수신 이벤트 receiveAll로 msg데이터를 전송한다.
      //io.emit()메소드는 서버소켓(io) 연결된 모든 사용자에게 메시지를 보낼때 사용..
      //io.emit('클라이언트 이벤트수신기명',클라이언트로 보낼데이터);
      io.emit("receiveAll", msg);
    });

    //템플릿에서 보내온 메시지 수신처리기
    socket.on("sendAll", function (nickName, message) {
      io.emit("broadCastAll", nickName, message);
    });

    //지정한 채팅방 개설 및 입장처리 메시지 이벤트 수신기
    //socket.on('서버측이벤트 수신기명',콜백함수(){});
    socket.on("entry", async (channel, nickName) => {
      //socket.join('채팅방이름');
      //socket.join('채팅방이름')은 서버환경에 해당 채팅방이름으로
      //채널을 개설하고 현재 입장하는 사용자를 해당 채팅방 사용자로 등록처리한다.
      //이미 해당 채널이 개설되어 있으면 신규개설하지 않고 기존 채널로 입장한다.
      socket.join(channel);

      //현재 접속자를 제외한 해당 채널에 이미 접속한 모든사용자에게 메시지를 발송한다.
      //socket.to('채널명').emit();
      socket
        .to(channel)
        .emit("entryOk", `${nickName}님이 ${channel} 채널에 입장했습니다.`);

      //현재 채널에 입장하고 있는 사용자에게만 메시지 발송하기
      //socket.emit(); 현재 서버소켓을 호출한(입장하는) 사용자에게만 메시지 발송하기
      socket.emit(
        "entryOk",
        ` ${nickName} 라는 대화명으로 ${channel} 채널에 입장했습니다.`
      );
    });

    //채팅방 기준으로 해당 채팅방의 나를 포함한 모든 사용자들에게 메시지 발송하기
    //클라이언트에서 메시지 데이터를 json포맷으로 전송한다.
    socket.on("channelMsg", async (msgData) => {
      //클라이언트로 보낼 메시지 포맷 정의하기
      const message = `${msgData.nickName}:${msgData.message}`;

      //io.to('채널명').emit()는 현재채널에
      //메시지를 보낸 당사자(나를) 포함한 현재 채널 모든 접속자(사용자)에게 메시지 보내기
      io.to(msgData.channel).emit("receiveChannel", message);
    });

    //접속한 채팅방 명시적 퇴장하기
    socket.on("exit", async (channel, nickName) => {
      //나를 제외한 채팅방내 모든 사용자에게 퇴장사실알림처리
      socket.to(channel).emit("exitOk", `${nickName}님이 퇴장했습니다.`);

      //socket.leave(채팅방명);//해당 채팅방 나가기 처리
      socket.leave(channel); //채팅방 퇴장처리

      //현재 퇴장하는 사용자한테도 메시지 전송하기
      socket.emit("exitOk", `채팅방을 퇴장했습니다.`);
    });

    //ChatGPT-4o와의 질문하고 답하기 처리 실시간 이벤트 수신기 정의
    //프론트엔드 소켓에서 호출하는 gpt서버 이벤트 수신기 정의
    socket.on("gpt", async (msg) => {
      //Step0: 사용자가 보내준 메시지 데이터를 다시 현재사용자에게 발송해 화면에 표시하기
      //socket.emit('gptMessage',msg); 현재 메시시를 보내온 사용자에게만 서버에서 메시지 발송하기
      socket.emit("gptMessage", msg);

      //Step1: 프론트엔드 소켓에서 전달해준 메시지 데이터 추출하기-prompt
      const prompt = msg.message;

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
      //Step4) 프론트엔드 소켓으로 GPT응답메시지 데이터 전송하기
      msg.message = gptMessage;
      msg.member_id = 0;
      socket.emit("gptMessage", msg);
    });
  });
};
