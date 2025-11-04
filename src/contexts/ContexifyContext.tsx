import { Menu, Item, Separator } from 'react-contexify'
import 'react-contexify/dist/ReactContexify.css'
import './index.scss'

export const ContexifyMenu = (props: { MENU_ID: string }) => {
  // 父组件传 ID
  const { MENU_ID } = props

  return (
    <Menu id={MENU_ID} animation="scale">
      <Item id="1">Item 1</Item>
      <Item id="2">Item 2</Item>
      <Separator />
      <Item id="3">Item 3</Item>
    </Menu>
  )
}
