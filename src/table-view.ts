import type { Node } from 'prosemirror-model'
import { addColumnAfter, addRowAfter, TableView } from 'prosemirror-tables'

export class CustomTableView extends TableView {
  constructor(node: Node) {
    super(node, 120)

    // create containers to hold the table and the add buttons
    const tableContainer = document.createElement('div')
    tableContainer.classList.add('tableContainer')
    // tableContainer.contentEditable = 'false'

    const tableOuterWrapper = document.createElement('div')
    tableOuterWrapper.classList.add('tableOuterWrapper')
    // tableOuterWrapper.contentEditable = 'false'

    // add the default table to the container
    tableOuterWrapper.appendChild(this.dom)
    tableContainer.appendChild(tableOuterWrapper)

    tableOuterWrapper.appendChild(createAddButton('column'))
    tableContainer.appendChild(createAddButton('row'))

    const div = document.createElement('div')
    div.innerText = 'Some text that should not be editable'
    tableContainer.appendChild(div)
    div.contentEditable = 'false'
    div.style.userSelect = 'none'

    // pass everything to the table view dom node
    this.dom = tableContainer

    this.table.contentEditable = 'true'
  }
}

function createAddButton(type: 'row' | 'column') {
  const button = document.createElement('button')
  button.className = `tableAddButton-${type}`
  button.innerText = '+'
  button.contentEditable = 'false'
  button.style.userSelect = 'none'
  button.addEventListener('click', () => {
    const view = window.view
    if (!view) {
      console.warn('no editor view found')
      return
    }

    if (type === 'row') {
      addRowAfter(view.state, view.dispatch.bind(view))
    } else {
      addColumnAfter(view.state, view.dispatch.bind(view))
    }
  })
  return button
}
