import * as React from 'react';
import { useState, useRef } from 'react';
import { NextPage, NextPageContext } from 'next';
import { Table, Radio, Divider, Button, Input, Space, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { Stage, Layer, Rect, Circle } from 'react-konva';
import Konva from 'konva';

const Test = ({ query }) => {
  const [mode, setMode] = useState(0)
  const stage: any = useRef<any>()
  const [rects, setRects] = useState([
    {
      x: 20,
      y: 20,
      width: 460,
      height: 460,
    },
  ]);

  const onDragMove = (e, i, editLeft, editTop) => {
    const rect = rects[i]
    const { x, y, width, height } = rect

    setRects(rects.map((rect) => {
      if (editLeft && rect.x === x) {
        rect.x = e.evt.layerX;
        rect.width = rect.width - (e.evt.layerX - x)
      }
      if (editTop && rect.y === y) {
        rect.y = e.evt.layerY;
        rect.height = rect.height - (e.evt.layerY - y)
      }

      if (!editLeft && rect.x + rect.width === x + width) {
        rect.width = e.evt.layerX - x
      }
      if (!editTop && rect.y + rect.height === y + height) {
        rect.height = e.evt.layerY - y
      }

      return rect;
    }))
  }

  const onMouseOut = () => {
    stage.current.container().style.cursor = 'default';
  }

  const onMouseOver = (position) => {
    return () => {
      stage.current.container().style.cursor = position;
    }
  }

  return (
    <>
      <Select value={mode} style={{ width: 200 }} onChange={(value) => {
        setMode(value)
      }}>
        <Select.Option value={0}> </Select.Option>
        <Select.Option value={1}>Horizontal Line</Select.Option>
        <Select.Option value={2}>Vertical Line</Select.Option>
        <Select.Option value={3}>Cross</Select.Option>
      </Select>
      <div style={{
        width: 500,
        height: 500,
        border: '1px solid black',
      }}>
        <Stage width={500} height={500} ref={stage}>
          <Layer>
            {
              rects.map((rect, i) => {
                return (
                  <>
                    <Rect
                      x={rect.x}
                      y={rect.y}
                      width={rect.width}
                      height={rect.height}
                      fill={Konva.Util.getRandomColor()}
                      draggable
                      onDragEnd={(e) => {
                        rects[i] = e.target.attrs
                        setRects([...rects])
                      }}
                      onClick={(e) => {
                        const { layerX, layerY }: any = e.evt
                        const { x, y, width, height } = rect;

                        const rightWidth = mode === 1 || mode === 3 ? x + width - layerX - 10 : width
                        const bottomHeight = mode === 2 || mode === 3 ? y + height - layerY - 10 : height
                        const topHeight = mode === 2 || mode === 3 ? layerY - y - 10 : height
                        const leftWidth = mode === 1 || mode === 3 ? layerX - x - 10 : width

                        if (mode === 1 || mode === 3) {
                          if (layerX - x > 10) {
                            rects.push({
                              x: layerX + 10,
                              y,
                              width: rightWidth,
                              height: topHeight,
                            })
                            rect.width = leftWidth;
                          }
                        }
                        if (mode === 2 || mode === 3) {
                          if (layerY - y > 10) {
                            rects.push({
                              x,
                              y: layerY + 10,
                              width: leftWidth,
                              height: bottomHeight,
                            })
                            rect.height = topHeight;
                          }
                        }

                        if (mode === 3) {
                          rects.push({
                            x: layerX + 10,
                            y: layerY + 10,
                            width: rightWidth,
                            height: bottomHeight,

                          })
                        }
                        setRects([...rects])
                      }}
                    />
                    <Circle
                      draggable
                      radius={5}
                      x={rect.x}
                      y={rect.y}
                      fill='black'
                      onMouseOver={onMouseOver('nw-resize')}
                      onMouseOut={onMouseOut}
                      onDragMove={(e) => {
                        onDragMove(e, i, true, true)
                      }}
                    />
                    <Circle
                      draggable
                      radius={5}
                      x={rect.x}
                      y={rect.y + rect.height}
                      fill='black'
                      onMouseOver={onMouseOver('sw-resize')}
                      onMouseOut={onMouseOut}
                      onDragMove={(e) => {
                        onDragMove(e, i, true, false)
                      }}
                    />
                    <Circle
                      draggable
                      radius={5}
                      x={rect.x + rect.width}
                      y={rect.y}
                      fill='black'
                      onMouseOver={onMouseOver('ne-resize')}
                      onMouseOut={onMouseOut}
                      onDragMove={(e) => {
                        onDragMove(e, i, false, true)
                      }}
                    />
                    <Circle
                      draggable
                      radius={5}
                      x={rect.x + rect.width}
                      y={rect.y + rect.height}
                      fill='black'
                      onMouseOver={onMouseOver('se-resize')}
                      onMouseOut={onMouseOut}
                      onDragMove={(e) => {
                        onDragMove(e, i, false, false)
                      }}
                    />
                  </>
                )
              })
            }
          </Layer>
        </Stage>
      </div>
    </>
  );
};

Test.getInitialProps = async (ctx: NextPageContext) => {
  const { query } = ctx;
  return { query };
};

export default Test;
