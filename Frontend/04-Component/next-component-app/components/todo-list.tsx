import { TodoType,ITodo } from "@/interface/todo";

type TodoListProps = {
   todos: TodoType[];
   removeItem: (index: number) => void;
 };

const TodoList = ({todos, removeItem}:TodoListProps) => {
   return (
      <ul> 
         {
            todos.map((todo, index) => (
               <li key={index} className="flex items-center justify-between border-b border-gray-300 py-2">
                  <span>{todo.title}</span>
                  <button 
                     type="button" 
                     onClick={()=>removeItem(index)} 
                     className="text-red-500 hover:text-red-600"
                  >
                     Delete
                  </button>
               </li>
            ))
         }
    </ul>
   );
}

export default TodoList;