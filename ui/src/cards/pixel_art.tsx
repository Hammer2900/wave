import React from 'react';
import { stylesheet } from 'typestyle';
import { Card, decode, Rec, S, socket, U } from '../delta';
import { cards } from '../grid';
import { getTheme } from '../theme';

const
    pixelSize = 20,
    canvasSize = pixelSize * 16,
    palette = '#ffffff #bfbfbf #808080 #404040 #000000 #6699ff #3366cc #003399 #99cc33 #00cc00 #669900 #ffcc00 #ff9900 #ff6600 #cc0000'.split(/\s+/g)

const
    theme = getTheme(),
    css = stylesheet({
        card: {
            display: 'flex',
            flexDirection: 'column',
        },
        title: {
            ...theme.font.s12,
            ...theme.font.w6,
        },
        canvas: {
            display: 'flex', flexWrap: 'wrap',
            width: canvasSize, height: canvasSize,
        },
        swatches: {
            paddingTop: 10,
            marginTop: 15,
            borderTop: '1px solid #ccc',
        },
        pixel: {
            display: 'inline-block',
            width: pixelSize, height: pixelSize,
        }
    }),
    defaultColorAt = (i: U): S => {
        const
            row = Math.floor(i / 16),
            col = i % 16,
            odd = col % 2 === 1
        return row % 2 === 0
            ? odd ? '#fff' : '#ddd'
            : odd ? '#ddd' : '#fff'

    }

interface Opts {
    name: S
    title: S
    data: Rec
}

interface Pixel {
    color: S
}

type State = Partial<Opts>

const defaults: State = {
    title: 'Untitled',
}

class View extends React.Component<Card<State>, State> {
    brush = '#000'
    onChanged = () => this.setState({ ...this.props.data })
    paint = (key: S, i: U) => {
        const page = socket.page()
        page.set(`${key} data ${i}`, this.brush === 'none' ? null : [this.brush])
        page.sync()
    }
    constructor(props: Card<State>) {
        super(props)
        this.state = { name: props.name, ...props.data }
        props.changed.on(this.onChanged)
    }
    render() {
        const
            s = theme.merge(defaults, this.state),
            data = decode<(Pixel | null)[]>(s.data),
            swatches = palette.map((c, i) => (
                <div
                    key={i}
                    className={css.pixel}
                    style={{ backgroundColor: c }}
                    onClick={() => this.brush = c}
                />
            )),
            pixels = data.map((p, i) => {
                const color = p ? p.color : defaultColorAt(i)
                return (
                    <div
                        key={i}
                        className={css.pixel}
                        style={{ backgroundColor: color }}
                        onClick={() => this.paint(s.name, i)}
                    />
                )
            })
        return (
            <div className={css.card}>
                <div className={css.title}>{s.title}</div>
                <div className={css.canvas}>{pixels}</div>
                <div className={css.swatches}>
                    <div className={css.pixel}>
                        <svg onClick={() => this.brush = 'none'} viewBox="0 0 433.25 433.25" width={pixelSize} height={pixelSize}>
                            <path d="M418.4,192.331c19.8-19.8,19.8-51.9,0-71.7l-0.1-0.1l-78.6-78.3c-19.8-19.8-51.9-19.7-71.8,0l-169.5,169.6l-54.2,54.1 c-19.8,19.7-19.8,51.8-0.1,71.6l48.3,48.3H10c-5.5,0-10,4.5-10,10s4.5,10,10,10h297.4c5.5,0,10-4.5,10-10s-4.5-10-10-10H225 l23.9-23.7L418.4,192.331z M196.7,385.831h-76.1l-62.3-62.4c-12-12-11.9-31.4,0-43.4l47.1-47l122.2,122L196.7,385.831z M119.6,218.931l162.5-162.5c12-12,31.5-12,43.5,0l78.6,78.4c12,12,12,31.4,0,43.5l-162.4,162.8L119.6,218.931z" />
                        </svg>
                    </div>
                    {swatches}
                </div>
            </div>)
    }
}

cards.register('pixel_art', View)
