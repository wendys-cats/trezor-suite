import React from 'react';
import { DotSlider } from './index';
import { storiesOf } from '@storybook/react';
import { StoryColumn } from '../../../support/Story';

storiesOf('Sliders', module).add(
    'Dot Slider',
    () => {
        return (
            <>
                <StoryColumn minWidth={300}>
                    <DotSlider steps={20} />
                </StoryColumn>
            </>
        );
    },
    {
        options: {
            showPanel: false,
        },
    }
);
