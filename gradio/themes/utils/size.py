class Size:
    def __init__(self, xxs, xs, sm, md, lg, xl, xxl):
        self.xxs = xxs
        self.xs = xs
        self.sm = sm
        self.md = md
        self.lg = lg
        self.xl = xl
        self.xxl = xxl

radius_none = Size(
    xxs="0px",
    xs="0px",
    sm="0px",
    md="0px",
    lg="0px",
    xl="0px",
    xxl="0px",
)

radius_sm = Size(
    xxs="1px",
    xs="1px",
    sm="2px",
    md="4px",
    lg="6px",
    xl="8px",
    xxl="12px",
)

radius_md = Size(
    xxs="1px",
    xs="2px",
    sm="4px",
    md="6px",
    lg="8px",
    xl="12px",
    xxl="22px",
)

radius_lg = Size(
    xxs="2px",
    xs="4px",
    sm="6px",
    md="8px",
    lg="12px",
    xl="16px",
    xxl="24px",
)

spacing_sm = Size(
    xxs="1px",
    xs="1px",
    sm="1px",
    md="2px",
    lg="4px",
    xl="6px",
    xxl="8px",
)

spacing_md = Size(
    xxs="1px",
    xs="2px",
    sm="4px",
    md="6px",
    lg="8px",
    xl="10px",
    xxl="16px",
)

spacing_lg = Size(
    xxs="1px",
    xs="2px",
    sm="4px",
    md="6px",
    lg="10px",
    xl="14px",
    xxl="24px",
)

text_sm = Size(
    xxs="9px",
    xs="11px",
    sm="12px",
    md="14px",
    lg="16px",
    xl="28px",
    xxl="20px",
)

text_md = Size(
    xxs="12px",
    xs="14px",
    sm="16px",
    md="18px",
    lg="20px",
    xl="22px",
    xxl="26px",
)

text_lg = Size(
    xxs="14px",
    xs="16px",
    sm="18px",
    md="20px",
    lg="22px",
    xl="24px",
    xxl="28px",
)

