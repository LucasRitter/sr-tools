import * as React from 'react'
import { InlineCode } from '~/ui/components/code/InlineCode'
import { Header } from '~/ui/components/Header'

export function NativeFsWarning() {
    return (
        <div>
            <Header>Oh no! Something went wrong!</Header>
            <div style={{ marginBottom: 4 }}>
                The Native Filesystem API seems to be disabled, but is required
                in order to view and edit files.
            </div>
            <div>
                To enable it, navigate to&nbsp;
                <InlineCode>chrome://flags/#native-file-system-api</InlineCode>
                and select
                <InlineCode style={{ background: '#55F', color: '#fff' }}>
                    Enabled
                </InlineCode>
                .
            </div>
        </div>
    )
}
