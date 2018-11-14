import React, { Component, Children } from 'react';
import PropTypes from 'prop-types';

const FPS = 20;
const STEP = 1;

class Marquee extends Component {

  static displayName = 'Marquee';

  static propTypes = {
    text: PropTypes.string,
    hoverToStop: PropTypes.bool,
    loop: PropTypes.bool,
    leading: PropTypes.number,
    trailing: PropTypes.number,
    className: PropTypes.string
  };

  static defaultProps = {
    text: '',
    hoverToStop: false,
    loop: false,
    leading: 0,
    trailing: 0
  };

  constructor (props) {
    super(props)
    this.fps = this.props.fps || FPS
    this.step = this.props.step || STEP
    this.animationTimeout = (1 / this.fps) * 1000

    this.state = {
      animatedWidth: 0,
      overflowWidth: 0
    };
  }

  componentDidMount() {
    this.measureText();

    if (this.props.hoverToStop) {
      this.startAnimation();
    }
  }

  componentDidUpdate() {
    this.measureText();

    if (this.props.hoverToStop) {
      this.startAnimation();
    }
  }

  componentWillUnmount() {
    clearTimeout(this.marqueeTimer);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.text.length !== nextProps.text.length) {
      clearTimeout(this.marqueeTimer);
      this.setState({ animatedWidth: 0 });
    }
  }

  handleMouseEnter = () => {
    if (this.props.hoverToStop) {
      clearTimeout(this.marqueeTimer);
    } else if (this.state.overflowWidth > 0){
      this.startAnimation();
    }
  }

  handleMouseLeave = () => {
    if (this.props.hoverToStop && this.state.overflowWidth > 0) {
      this.startAnimation();
    } else {
      clearTimeout(this.marqueeTimer);
      this.setState({ animatedWidth: 0 });
    }
  }

  startAnimation = () => {
    clearTimeout(this.marqueeTimer);
    const isLeading = this.state.animatedWidth === 0;
    const timeout = isLeading ? this.props.leading : this.animationTimeout;

    const animate = () => {
      const {overflowWidth} = this.state;
      let animatedWidth = this.state.animatedWidth + this.step;
      const isRoundOver = animatedWidth > overflowWidth;

      if (isRoundOver) {
        if (this.props.loop) {
          animatedWidth = 0;
        } else {
          return;
        }
      }

      if (isRoundOver && this.props.trailing) {
        this.marqueeTimer = setTimeout(() => {
          this.setState({ animatedWidth });
          this.marqueeTimer = setTimeout(animate, this.animationTimeout);
        }, this.props.trailing);
      } else {
        this.setState({ animatedWidth });
        this.marqueeTimer = setTimeout(animate, this.animationTimeout);
      }
    };

    this.marqueeTimer = setTimeout(animate, timeout);
  }

  measureText = () => {
    const container = this.container;
    const node = this.text;

    if (container && node) {
      const containerWidth = container.offsetWidth;
      const textWidth = node.offsetWidth;
      const overflowWidth = textWidth - containerWidth;

      if (overflowWidth !== this.state.overflowWidth) {
        this.setState({ overflowWidth });
      }
    }
  }

  getTitle () {
    if (this.props.tooltip) {
      return this.props.text
    }
    return null
  }

  render() {
    const style = {
      'position': 'relative',
      'right': this.state.animatedWidth,
      'whiteSpace': 'nowrap'
    };

    if (this.state.overflowWidth < 0) {
      return (
        <div
          ref={(el) => { this.container = el; }}
          className={`ui-marquee ${this.props.className}`}
          style={{ overflow: 'hidden' }}
        >
          <span
            ref={(el) => { this.text = el; }}
            style={style}
            title={this.getTitle()}
          >
            {this.props.text}
          </span>
        </div>
      );
    }

    return (
      <div
        ref={(el) => { this.container = el; }}
        className={`ui-marquee ${this.props.className}`.trim()}
        style={{ overflow: 'hidden' }}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        <span
          ref={(el) => { this.text = el; }}
          style={style}
          title={this.getTitle()}
        >
          {this.props.text}
        </span>
      </div>
    );
  }
}


export default Marquee;
