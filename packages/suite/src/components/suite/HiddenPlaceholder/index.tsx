import React from 'react';
import { Props } from './Container';
import styled, { css } from 'styled-components';

interface WrapperProps {
    intensity: number;
    discreetMode: boolean;
}

const Wrapper = styled.span<WrapperProps>`
    padding: 0px 0px;
    ${props =>
        props.discreetMode &&
        css`
            transition: filter 0.1s ease, padding 1s ease;
            padding: 0px 5px;
            filter: blur(${props.intensity}px);

            &:hover {
                filter: none;
            }
        `}
`;

const HiddenPlaceholder = ({ children, discreetMode, intensity = 5, className }: Props) => (
    <Wrapper discreetMode={discreetMode} intensity={intensity} className={className}>
        {children}
    </Wrapper>
);

export default HiddenPlaceholder;
