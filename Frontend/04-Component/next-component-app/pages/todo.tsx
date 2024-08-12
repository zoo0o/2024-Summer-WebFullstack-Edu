import { useState } from "react";

//컴포넌트 공통 타입 참조하기 
import { TodoType, ITodo } from "@/interface/todo";

import TodoTemplate from "@/components/todo-template";
import TodoRegist from "@/components/todo-regist";
import TodoList from "@/components/todo-list";

const Todo = () => {

   //단일 할 일 정보 상태 정의 및 초기화
   const [todo, setTodo] = useState<TodoType>({
      title:'',
      desc:'',
      selected: false,
   })

   //할 일 목록 상태 정의 및 초기화
   const [todos, setTodos] = useState<TodoType[]>([]);

   //할 일 등록 텍스트 박스 변경 이벤트 처리 함수
   const todoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setTodo({...todo, title: e.target.value});
   };

   //단일 할 일 정보 저장 이벤트 처리 함수
   const onSave = () => {
      //할 일 목록에 신규 할 일 객체 추가하기
      setTodos([...todos, todo]);
   }

   const removeItem = (index:number) => {
      const filteredTodos = todos.filter(
         (item: TodoType, i:number) => i !== index,
      );
      setTodos(filteredTodos);
   };

   return (
      <TodoTemplate>
         <TodoRegist todo={todo} todoChange={todoChange} onSave={onSave} />
         <TodoList todos = {todos} removeItem={removeItem} />
      </TodoTemplate>
  );
};

export default Todo;