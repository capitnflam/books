import { Col, Row } from 'antd'
import React from 'react'

import Card from '../../components/Book/Card'

export default function Collection(): JSX.Element {
  return (
    <>
      <p>Library</p>
      <div style={{ flexGrow: 1 }}>
        <Col>
          <Row>
            <Card />
          </Row>
        </Col>
      </div>
    </>
  )
}
