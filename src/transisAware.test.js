import transisAware, { updateQueue } from 'transisAware' // sometimes two instance of transis occurs

// TODOS:
// lifecycle
// transisId ( need to share with Legacy )
// state and prop mixin conflict
// rerender times, use jasmine if necessary

const Model = Transis.Object.extend(function() {
  this.prop('foo')
  this.prop('bar')
  this.prop('baz')
  this.prototype.reset = function() {
    this.foo = 'foo 1';
    this.bar = 'bar 1';
    this.baz = 'baz 1';
    Transis.Object.flush()
  }
})

const CoreComponent = ({
  model: { foo, bar, baz }
}) => <div>
  <div className="foo">{foo}</div>
  <div className="bar">{bar}</div>
  <div className="baz">{baz}</div>
</div>

describe('PropMixin', function() {
  // with prop mixin
  let component;
  const model = new Model()

  const PropMixinComponent = transisAware({
    props: { model: ['foo', 'bar'] }
  }, CoreComponent)

  beforeEach(() => {
    model.reset()
    component = mount(<PropMixinComponent model={model}/>)
  })
  afterEach(() => component.unmount())

  it('W/O PropMixin WILL NOT update', () => {
    const noMixin = mount(<CoreComponent model={model}/>)
    model.foo = 'foo 2'
    Transis.Object.flush() // needed for running this single it
    expect(noMixin.find('.foo').text()).toBe('foo 1')
  })

  it('initially', () => {
    expect(component.find('.foo').text()).toBe('foo 1')
  })

  it('Changes w/ props mixins', () => {
    model.foo = 'foo 2'
    Transis.Object.flush() // needed for running this single it
    expect(component.find('.foo').text()).toBe('foo 2')
  })
})

describe('StateMixin', () => {
  const AppState = Transis.Object.extend(function() {
    this.prop('model')
    this.prop('a')
    this.prop('b')
  })
  const appState = new AppState({ model: new Model })
  // with state mixin
  const StateMixinComponent = transisAware({
    global: appState,
    state: { model: ['baz'] }
  }, CoreComponent)
  let component;

  beforeEach(() => {
    appState.model.reset()
    component = mount(<StateMixinComponent />)
  })
  afterEach(() => component.unmount())

  it('initially', () => {
    expect(component.find('.foo').text()).toBe('foo 1')
    expect(component.find('.bar').text()).toBe('bar 1')
    expect(component.find('.baz').text()).toBe('baz 1')
  })

  it('Changes w/ state mixins', () => {
    appState.model.foo = 'foo 2'
    Transis.Object.flush()
    expect(component.find('.foo').text()).toBe('foo 1')

    appState.model.bar = 'bar 2'
    Transis.Object.flush()
    expect(component.find('.bar').text()).toBe('bar 1')

    appState.model.baz = 'baz 2'
    Transis.Object.flush()
    expect(component.find('.foo').text()).toBe('foo 2')
    expect(component.find('.bar').text()).toBe('bar 2')
    expect(component.find('.baz').text()).toBe('baz 2')
  })

  it('understand argument (globalVar, "a", "b") as (globalVar, { a: [], b: []}) ', () => {
    const SmartMixinComponent = transisAware(
      {
        global: new AppState({ a: 'Abc', b: 'Bcd' }),
        state: ['a', 'b']
      },
      ({ a, b }) => <div>{a}, {b}</div>
    )
    let component = mount(<SmartMixinComponent />)
    expect(component.text()).toBe('Abc, Bcd')
  })
})