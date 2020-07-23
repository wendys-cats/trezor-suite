import React, { useState } from 'react';
import { useSpring, animated } from 'react-spring';
import styled, { css } from 'styled-components';
import { colors, variables } from '../../../config';

const DOT_WIDTH = 10;
const DOT_SPACE = 5;

const Wrapper = styled.div`
    display: flex;
    width: 300px;
    overflow: hidden;
    height: 62px;
    flex-direction: column;

    border: 1px solid red;
`;

const Dot = styled.div<{ isActive?: boolean }>`
    width: ${DOT_WIDTH}px;
    height: ${DOT_WIDTH}px;
    background: lime;
    border-radius: 100%;
    margin-right: ${DOT_SPACE}px;

    ${props =>
        props.isActive &&
        css`
            background: ${colors.NEUE_BG_GREEN};
        `}
`;

const VisibleContainer = styled.div`
    display: flex;
    border: 1px solid red;
    align-items: center;
    height: 20px;
    overflow: hidden;
`;

const Arrow = styled.div`
    cursor: pointer;
`;

const Controls = styled.div``;

interface Props {
    steps?: number;
    activeStep?: number;
    visibleDots?: number;
}

const isActive = (i: number, activeStep?: number) => false;

const DotSlider = ({ steps, activeStep, visibleDots = 5 }: Props) => {
    const dotAndSpace = DOT_WIDTH + DOT_SPACE;
    const [marginLeft, setMarginLeft] = useState<number>(0);

    const props = useSpring({
        to: { marginLeft },
    });

    return (
        <Wrapper>
            <animated.div style={props}>
                <VisibleContainer>
                    {[...Array(steps)].map((_x, i) => (
                        <Dot isActive={isActive(i, activeStep)} />
                    ))}
                </VisibleContainer>
            </animated.div>
            <Controls>
                <Arrow onClick={() => setMarginLeft(marginLeft - dotAndSpace)}>left</Arrow>
                <Arrow onClick={() => setMarginLeft(marginLeft + dotAndSpace)}>right</Arrow>
                <Arrow onClick={() => setMarginLeft(0)}>reset</Arrow>
            </Controls>
        </Wrapper>
    );
};

export { DotSlider, Props as DotSliderProps };
