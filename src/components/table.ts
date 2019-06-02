import { htm as html } from '@zeit/integration-utils'

export const Table = ({
  header,
  children,
}: {
  header: any
  children: any
}) => html`
  <Box
    width="100%"
    display="table"
    borderRadius="5px"
    borderColor="#eaeaea"
    overflow="hidden"
    borderStyle="solid"
    borderWidth="1px"
    marginTop="20px"
    marginBottom="20px"
  >
    <Box display="table-header-group" backgroundColor="rgb(250, 250, 250)">
      <Box display="table-row">
        ${header}
      </Box>
    </Box>
    <Box display="table-row-group">
      ${children}
    </Box>
  </Box>
`

export const TableRow = ({ children }: { children: any }) => html`
  <Box
    display="table-row"
    borderColor="#eaeaea"
    borderStyle="solid"
    borderBottomWidth="1px"
    backgroundColor="white"
  >
    ${children}
  </Box>
`

export const HeaderItem = ({ children }: { children: any }) => html`
  <Box
    display="table-cell"
    padding="10px"
    borderColor="#eaeaea"
    borderStyle="solid"
    borderWidth="0px"
    borderBottomWidth="1px"
    ><P><B>${children}</B></P></Box
  >
`

export const BodyItem = ({ children }: { children: any }) => html`
  <Box display="table-cell" padding="10px"><P>${children}</P></Box>
`


export const Method = ({ children }: { children: any }) => html`
<Box
  fontSize="11px"
  lineHeight="16px"
  fontWeight="bold"
  color="white"
  backgroundColor="black"
  padding="1px 5px 2px"
  borderRadius="3px"
  >${children}</Box
>
`

export const Status = ({ active }: { active: boolean }) => html`
  <Box
    display="inline-block"
    color="white"
    width="10px"
    height="10px"
    borderRadius="10px"
    marginLeft="5px"
    backgroundColor="${active ? 'rgb(80, 227, 194)' : 'red'}"
  />
`