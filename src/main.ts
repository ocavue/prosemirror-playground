import './style.css'
import 'prosemirror-view/style/prosemirror.css'
import 'prosemirror-tables/style/tables.css'

import { buildMenuItems, exampleSetup } from 'prosemirror-example-setup'
import { keymap } from 'prosemirror-keymap'
import { Dropdown, type MenuElement, MenuItem } from 'prosemirror-menu'
import { DOMParser, Schema } from 'prosemirror-model'
import { schema as basicSchema } from 'prosemirror-schema-basic'
import { addListNodes } from 'prosemirror-schema-list'
import { type Command, EditorState, type Plugin } from 'prosemirror-state'
import {
  addColumnAfter,
  addColumnBefore,
  addRowAfter,
  addRowBefore,
  columnResizing,
  deleteColumn,
  deleteRow,
  deleteTable,
  goToNextCell,
  mergeCells,
  setCellAttr,
  splitCell,
  tableEditing,
  tableNodes,
  toggleHeaderCell,
  toggleHeaderColumn,
  toggleHeaderRow,
} from 'prosemirror-tables'
import { EditorView } from 'prosemirror-view'

function createSchema() {
  const marks = basicSchema.spec.marks
  let nodes = basicSchema.spec.nodes

  // Mix the nodes from prosemirror-schema-list into the basic schema to
  // create a schema with list support.
  nodes = addListNodes(nodes, 'paragraph block*', 'block')

  // Add the table nodes to the schema
  nodes = nodes.append(
    tableNodes({
      tableGroup: 'block',
      cellContent: 'block+',
      cellAttributes: {
        background: {
          default: null,
          getFromDOM(dom) {
            return dom.style.backgroundColor || null
          },
          setDOMAttr(value, attrs) {
            if (value)
              attrs.style =
                `background-color: ${value as string};` +
                String((attrs.style as string) || '')
          },
        },
      },
    }),
  )

  return new Schema({
    nodes,
    marks,
  })
}

function createTableRow(schema: Schema, cols: number) {
  const { table_row, table_cell } = schema.nodes
  const content = []
  for (let i = 0; i < cols; i++) {
    content.push(table_cell.createAndFill()!)
  }
  return table_row.createChecked(null, content)
}

function createTable(schema: Schema, rows: number, cols: number) {
  const { table } = schema.nodes
  const content = []
  for (let i = 0; i < rows; i++) {
    content.push(createTableRow(schema, cols))
  }
  return table.createChecked(null, content)
}

const insertTable: Command = (state, dispatch) => {
  const schema = state.schema
  const table = createTable(schema, 3, 3)
  const tr = state.tr.replaceSelectionWith(table)
  dispatch?.(tr)
  return true
}

function createTableMenu(): MenuElement {
  function item(label: string, cmd: (state: EditorState) => boolean) {
    return new MenuItem({ label, select: cmd, run: cmd })
  }

  const tableMenu = [
    item('Insert table', insertTable),
    item('Insert column before', addColumnBefore),
    item('Insert column after', addColumnAfter),
    item('Delete column', deleteColumn),
    item('Insert row before', addRowBefore),
    item('Insert row after', addRowAfter),
    item('Delete row', deleteRow),
    item('Delete table', deleteTable),
    item('Merge cells', mergeCells),
    item('Split cell', splitCell),
    item('Toggle header column', toggleHeaderColumn),
    item('Toggle header row', toggleHeaderRow),
    item('Toggle header cells', toggleHeaderCell),
    item('Make cell green', setCellAttr('background', '#dfd')),
    item('Make cell not-green', setCellAttr('background', null)),
  ]

  return new Dropdown(tableMenu, { label: 'Table' })
}

function createMenuContent(schema: Schema): MenuElement[][] {
  const { fullMenu } = buildMenuItems(schema)

  fullMenu.splice(2, 0, [createTableMenu()])

  return fullMenu
}

function createPlugins(schema: Schema) {
  const menuContent = createMenuContent(schema)
  return [
    columnResizing(),
    tableEditing(),
    keymap({
      Tab: goToNextCell(1),
      'Shift-Tab': goToNextCell(-1),
    }),
    ...exampleSetup({ schema, menuContent }),
  ].filter((x) => !!x)
}

function createView(schema: Schema, plugins: Plugin[]) {
  return new EditorView(document.querySelector('#editor'), {
    state: EditorState.create({
      doc: DOMParser.fromSchema(schema).parse(
        document.querySelector('#content')!,
      ),
      plugins,
    }),
  })
}

function main() {
  const schema = createSchema()
  const plugins = createPlugins(schema)
  const view = createView(schema, plugins)
  window.view = view
}

main()

declare global {
  interface Window {
    view?: EditorView
  }
}
