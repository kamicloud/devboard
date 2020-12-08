import * as React from 'react';
import { useState, useRef } from 'react';
import { NextPage, NextPageContext } from 'next';
import { Table, Radio, Divider, Button, Input, Space, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { Stage, Layer, Rect, Circle, Text, Label, Tag } from 'react-konva';
import Konva from 'konva';

const MODE_NONE = 0;
const MODE_HORIZONTAL = 1;
const MODE_VERTICAL = 2;
const MODE_CROSS = 3;

const Test = ({ query }) => {
  const [config, setConfig] = useState({
    width: 1600,
    height: 900,
  })
  const [tool, setTool] = useState({
    mode: 0,
    sizeTip: {
      visible: false,
      rect: {
        width: 0,
        height: 0,
      },
      x: 0,
      y: 0,
    },
  })
  const [draggablePointRadius] = useState(3)
  const [border] = useState(20);

  const initRects = () => {
    return [
      {
        x: border,
        y: border,
        width: config.width - border * 2,
        height: config.height - border * 2,
      },
    ];
  }

  const [rects, setRects] = useState(initRects());

  const stage: any = useRef<any>()

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
      <Input value={config.width} type='number' onChange={e => {
        setConfig({ ...config, width: parseInt(e.target.value) })
      }} />
      <Input value={config.height} type='number' onChange={e => {
        setConfig({ ...config, height: parseInt(e.target.value) })
      }} />
      <Button onClick={() => {
        setRects(initRects())
      }}>Init</Button>
      <Select value={tool.mode} style={{ width: 200 }} onChange={(value) => {
        setTool({ ...tool, mode: value })
      }}>
        <Select.Option value={MODE_NONE}>{' '}</Select.Option>
        <Select.Option value={MODE_HORIZONTAL}>Horizontal Line</Select.Option>
        <Select.Option value={MODE_VERTICAL}>Vertical Line</Select.Option>
        <Select.Option value={MODE_CROSS}>Cross</Select.Option>
      </Select>
      <Button onClick={() => {
        setConfig(config)
        setRects(rects.map(rect => {
          return {
            x: rect.y,
            y: rect.x,
            width: rect.height,
            height: rect.width
          }
        }))
      }}>Rotate</Button>
      <div style={{
        width: config.width,
        height: config.height,
        border: '1px solid black',
      }}>
        <Stage
        width={config.width}
        height={config.height}
        ref={stage}
        scale={{x:0.5, y:0.5}}
        >
          <Layer>
            {
              rects.map((rect, i) => {
                return (
                  <>
                    <Rect
                      {...rect}
                      fill='lightblue'
                      // draggable
                      // onDragEnd={(e) => {
                      //   rects[i] = e.target.attrs
                      //   setRects([...rects])
                      // }}
                      onMouseMove={(e: any) => {
                        tool.sizeTip.visible = true;
                        tool.sizeTip.x = e.evt.layerX;
                        tool.sizeTip.y = e.evt.layerY;
                        tool.sizeTip.rect = rect;

                        setTool({ ...tool })
                      }}
                      onMouseOut={() => {
                        tool.sizeTip.visible = false;
                        setTool({ ...tool })
                      }}
                      onClick={(e) => {
                        const { layerX, layerY }: any = e.evt
                        const { x, y, width, height } = rect;

                        const leftWidth = tool.mode === MODE_HORIZONTAL || tool.mode === MODE_CROSS ? layerX - x - border / 2 : width
                        const rightWidth = tool.mode === MODE_HORIZONTAL || tool.mode === MODE_CROSS ? x + width - layerX - border / 2 : width
                        const topHeight = tool.mode === MODE_VERTICAL || tool.mode === MODE_CROSS ? layerY - y - border / 2 : height
                        const bottomHeight = tool.mode === MODE_VERTICAL || tool.mode === MODE_CROSS ? y + height - layerY - border / 2 : height

                        if ((tool.mode === MODE_HORIZONTAL || tool.mode === MODE_CROSS) && layerX - x > border / 2) {
                          rects.push({
                            x: layerX + border / 2,
                            y,
                            width: rightWidth,
                            height: topHeight,
                          })
                          rect.width = leftWidth;
                        }
                        if ((tool.mode === MODE_VERTICAL || tool.mode === MODE_CROSS) && layerY - y > border / 2) {
                          rects.push({
                            x,
                            y: layerY + border / 2,
                            width: leftWidth,
                            height: bottomHeight,
                          })
                          rect.height = topHeight;
                        }

                        if (tool.mode === MODE_CROSS) {
                          rects.push({
                            x: layerX + border / 2,
                            y: layerY + border / 2,
                            width: rightWidth,
                            height: bottomHeight,
                          })
                        }
                        setRects([...rects])
                      }}
                    />
                    <Circle
                      draggable
                      radius={draggablePointRadius}
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
                      radius={draggablePointRadius}
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
                      radius={draggablePointRadius}
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
                      radius={draggablePointRadius}
                      x={rect.x + rect.width}
                      y={rect.y + rect.height}
                      fill='black'
                      onMouseOver={onMouseOver('se-resize')}
                      onMouseOut={onMouseOut}
                      onDragMove={(e) => {
                        onDragMove(e, i, false, false)
                      }}
                    />
                    <Text
                      text={`${rect.width},${rect.height}`}
                      x={rect.x + rect.width / 2 - 40}
                      y={rect.y + rect.height / 2 - 15}
                      width={80}
                      height={20}
                      align='center'
                      verticalAlign='middle'
                    />
                    {/* <Text
                      text={`${parseInt((rect.width / config.width * 1000000).toString()) / 10000}%,${parseInt((rect.height / config.height * 1000000).toString()) / 10000}%`}
                      x={rect.x + rect.width / 2 - 60}
                      y={rect.y + rect.height / 2 - 5}
                      width={120}
                      height={20}
                      align='center'
                      verticalAlign='middle'
                    /> */}
                  </>
                )
              })
            }
            <Label
              opacity={0.75}
              visible={tool.sizeTip.visible}
              listening={false}
              x={tool.sizeTip.x}
              y={tool.sizeTip.y}
            >
              <Tag
                fill='black'
                pointerDirection='down'
                pointerWidth={10}
                pointerHeight={10}
                lineJoin='round'
                shadowColor='black'
                shadowBlur={10}
                shadowOffsetX={10}
                shadowOffsetY={10}
                shadowOpacity={0.2}
              />
              <Text
                text={`${parseInt((tool.sizeTip.rect.width / config.width * 1000000).toString()) / 10000}%,${parseInt((tool.sizeTip.rect.height / config.height * 1000000).toString()) / 10000}%`}
                fontFamily='Calibri'
                fontSize={18}
                padding={5}
                align='center'
                fill='white'
              />
            </Label>
          </Layer>
          <Layer>
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
