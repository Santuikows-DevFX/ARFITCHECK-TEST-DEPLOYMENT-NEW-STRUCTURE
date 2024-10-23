import * as React from 'react';
import { Transition } from 'notistack';
import {
  useForkRef,
  reflow,
  getTransitionProps,
  createTransition,
} from '../shared.js';

const styles = {
  entering: {
    transform: 'none',
  },
  entered: {
    transform: 'none',
  },
};

const Zoom = React.forwardRef((props, ref) => {
  const {
    children,
    in: inProp,
    style,
    timeout = 0,
    onEnter,
    onEntered,
    onExit,
    onExited,
    ...other
  } = props;

  const nodeRef = React.useRef(null);
  const handleRefIntermediary = useForkRef(children.ref, ref);
  const handleRef = useForkRef(nodeRef, handleRefIntermediary);

  const handleEnter = (node, isAppearing) => {
    reflow(node);

    const transitionProps = getTransitionProps({
      style,
      timeout,
      mode: 'enter',
    });

    node.style.webkitTransition = createTransition(
      'transform',
      transitionProps
    );
    node.style.transition = createTransition('transform', transitionProps);

    if (onEnter) {
      onEnter(node, isAppearing);
    }
  };

  const handleExit = (node) => {
    const transitionProps = getTransitionProps({
      style,
      timeout,
      mode: 'exit',
    });

    node.style.webkitTransition = createTransition(
      'transform',
      transitionProps
    );
    node.style.transition = createTransition('transform', transitionProps);

    if (onExit) {
      onExit(node);
    }
  };

  return (
    <Transition
      appear
      in={inProp}
      nodeRef={nodeRef}
      onEnter={handleEnter}
      onEntered={onEntered}
      onExit={handleExit}
      onExited={onExited}
      timeout={timeout}
      {...other}
    >
      {(state, childProps) =>
        React.cloneElement(children, {
          style: {
            transform: 'scale(0)',
            visibility: state === 'exited' && !inProp ? 'hidden' : undefined,
            ...styles[state],
            ...style,
            ...children.props.style,
          },
          ref: handleRef,
          ...childProps,
        })
      }
    </Transition>
  );
});

Zoom.displayName = 'Zoom';

export default Zoom;
