import { makeAutoObservable } from 'mobx'
import { v4 } from 'uuid'
import { IColumn, IDBColumn, ITodo } from './types'
import { DEFAULTS } from './utils/constants'

class Index {
	droppableId: string = v4()
	bgImageUrl: string = DEFAULTS.bgImageUrl
	createdItemId: string = ''
	wasAddItemClicked: boolean = false
	columns = new Set<IColumn>()

	constructor() {
		makeAutoObservable(this)
		this.getBgImageUrlFromLocalStorage()
		this.getColumnsFromLocalStorage()
	}

	getColumns() {
		return Array.from(this.columns)
	}

	getColumnName(column: IColumn) {
		return column.name
	}

	setColumnName(column: IColumn, name: string) {
		column.name = name
		this.droppableId = v4()
		this.saveColumnsToLocalStorage()
	}

	createColumn(name: string) {
		const id = v4()
		this.columns.add({
			id,
			name: name.trim(),
			todos: new Set(),
		})
		this.droppableId = v4()
		this.createdItemId = id
		setTimeout(() => {
			this.createdItemId = ''
		}, 200)
		this.saveColumnsToLocalStorage()
	}

	deleteColumn(column: IColumn) {
		this.columns.delete(column)
		this.droppableId = v4()
		this.saveColumnsToLocalStorage()
	}

	createTodo(column: IColumn, name: string) {
		const id = v4()
		column.todos.add({
			id,
			title: name.trim(),
			description: '',
			creationDate: Date.now(),
			editDate: Date.now(),
		})
		this.droppableId = v4()
		this.createdItemId = id
		setTimeout(() => {
			this.createdItemId = ''
		}, 200)
		this.saveColumnsToLocalStorage()
	}

	getTodos(column: IColumn) {
		return Array.from(column.todos)
	}

	getTodoTitle(todo: ITodo) {
		return todo.title
	}

	setTodoTitle(todo: ITodo, title: string) {
		todo.title = title
		this.droppableId = v4()
		this.saveColumnsToLocalStorage()
	}

	setTodoEditDate(todo: ITodo, date: number) {
		todo.editDate = date
		this.droppableId = v4()
		this.saveColumnsToLocalStorage()
	}

	getTodoDescription(todo: ITodo) {
		return todo.description
	}

	setTodoDescription(todo: ITodo, description: string) {
		todo.description = description
		this.droppableId = v4()
		this.saveColumnsToLocalStorage()
	}

	deleteTodo(column: IColumn, todo: ITodo) {
		column.todos.delete(todo)
		this.droppableId = v4()
		this.saveColumnsToLocalStorage()
	}

	getColumnById(id: string): IColumn | null {
		let column: IColumn | null = null
		this.columns.forEach((col) => {
			if (col.id === id) {
				column = col
				return
			}
		})
		return column
	}

	getTodoById(column: IColumn, id: string): ITodo | null {
		let todo: ITodo | null = null
		column.todos.forEach((t) => {
			if (t.id === id) {
				todo = t
				return t
			}
		})
		return todo
	}

	moveTodo(sourceColumnId: string, destinationColumnId: string, todoId: string, destinationIndex: number) {
		const sourceColumn = this.getColumnById(sourceColumnId)
		const destinationColumn = this.getColumnById(destinationColumnId)
		if (!sourceColumn || !destinationColumn) return
		const todo = this.getTodoById(sourceColumn, todoId)
		if (!todo) return
		sourceColumn.todos.delete(todo)
		const newTodosArray = Array.from(destinationColumn.todos)
		newTodosArray.splice(destinationIndex, 0, todo)
		destinationColumn.todos = new Set(newTodosArray)
		this.droppableId = v4()
		this.saveColumnsToLocalStorage()
	}

	moveColumn(sourceColumnIndex: number, destinationColumnIndex: number) {
		const columnsArray = Array.from(this.columns)
		const column = { ...columnsArray[sourceColumnIndex] }
		columnsArray.splice(sourceColumnIndex, 1)
		columnsArray.splice(destinationColumnIndex, 0, column)
		this.columns = new Set(columnsArray)
		this.droppableId = v4()
		this.saveColumnsToLocalStorage()
	}

	saveColumnsToLocalStorage() {
		const columns: IDBColumn[] = []
		this.columns.forEach(({ id, name, todos }) => {
			const newColumnTodos: ITodo[] = []
			todos.forEach(({ id, title, description, creationDate, editDate }) => {
				newColumnTodos.push({ id, title, description, creationDate, editDate })
			})
			const newColumn: IDBColumn = {
				id,
				name,
				todos: newColumnTodos,
			}
			columns.push(newColumn)
		})
		localStorage.setItem('columns-data', JSON.stringify(columns))
	}

	getColumnsFromLocalStorage() {
		const item = localStorage.getItem('columns-data')
		if (!item) return
		const data: IDBColumn[] = JSON.parse(item)
		const columns = new Set<IColumn>()
		data.forEach(({ id, name, todos }) => {
			const newTodos = new Set<ITodo>()
			todos.forEach(({ id, title, description, creationDate, editDate }) => {
				newTodos.add({ id, title, description, creationDate, editDate })
			})
			columns.add({ id, name, todos: newTodos })
		})
		this.columns = columns
	}

	saveBgImageUrlToLocalStorage() {
		localStorage.setItem('bg-image-url', this.bgImageUrl)
	}

	getBgImageUrlFromLocalStorage() {
		this.bgImageUrl = localStorage.getItem('bg-image-url') || DEFAULTS.bgImageUrl
	}

	setBgImageUrl(imgUrl: string) {
		this.bgImageUrl = imgUrl
		this.saveBgImageUrlToLocalStorage()
	}
}

const store = new Index()

export { store }
