import hbs from 'htmlbars-inline-precompile';
import { click, find } from 'ember-native-dom-helpers';
import { isVisible } from 'ember-attacher';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('ember-attacher', 'Integration | Component | isShown', {
  integration: true
});

test('isShown works with showOn/hideOn set to "click"', async function(assert) {
  assert.expect(3);

  this.render(hbs`
    <button id="toggle-show">
      Click me, captain!

      {{#attach-popover id='attachment'
                        hideOn='click'
                        isShown=true
                        showOn='click'}}
        isShown w/ hideOn/ShowOn of 'click'
      {{/attach-popover}}
    </button>
  `);

  const attachment = find('#attachment');

  assert.equal(isVisible(attachment), true, 'Initially shown');

  await click('#toggle-show');

  assert.equal(isVisible(attachment), false, 'Now hidden');

  await click('#toggle-show');

  assert.equal(isVisible(attachment), true, 'Shown again after click');
});

test('isShown works with showOn/hideOn set to `null`', async function(assert) {
  assert.expect(3);

  this.on('closePopover', () => {
    this.set('isShown', false);
  });

  this.on('openPopover', () => {
    this.set('isShown', true);
  });

  this.set('isShown', false);

  this.set('hideOn', null);
  this.set('showOn', null);

  this.render(hbs`
    <button id="open" {{action 'openPopover'}}>
      Click me, captain!

      {{#attach-popover id='attachment'
                        hideOn=hideOn
                        isShown=isShown
                        showOn=showOn}}
        isShown w/ hideOn/ShowOn of 'none'

        <button id="close" {{action 'closePopover'}}>
          Close
        </button>

      {{/attach-popover}}
    </button>
  `);

  const attachment = find('#attachment');

  assert.equal(isVisible(attachment), false, 'Initially hidden');

  await click('#open');

  assert.equal(isVisible(attachment), true, 'Now shown');

  await click('#close');

  assert.equal(isVisible(attachment), false, 'Hidden again');
});

test('nested attachers open and close as expected', async function(assert) {
  assert.expect(7);

  this.on('openParentPopover', () => {
    this.set('parentIsShown', true);
  });

  this.on('closeChildPopover', () => {
    this.set('childIsShown', false);
  });

  this.on('openChildPopover', () => {
    this.set('childIsShown', true);
  });

  this.set('hideOn', null);
  this.set('showOn', null);

  this.setProperties({
    childIsShown: false,
    parentIsShown: false
  });

  this.render(hbs`
    <button id="openParent" {{action 'openParentPopover'}}>
      Open parent

      {{#attach-popover hideOn=hideOn
                        id='parent'
                        isShown=parentIsShown
                        showOn=showOn}}
        <button id="openChild" {{action 'openChildPopover'}}>
          Open child

          {{#attach-popover hideDuration=0
                            hideOn='none'
                            id='child'
                            isShown=childIsShown
                            showOn='none'}}
            <button id="closeChild" {{action 'closeChildPopover'}}>
              Close child
            </button>
          {{/attach-popover}}
        </button>
      {{/attach-popover}}
    </button>
  `);

  const childAttacher = find('#child');
  const parentAttacher = find('#parent');

  assert.equal(parentAttacher.style.display, 'none', 'parent initially hidden');
  assert.equal(childAttacher.style.display, 'none', 'child initially hidden');

  await click('#openParent');

  assert.equal(parentAttacher.style.display, '', 'parent shown');

  assert.equal(childAttacher.style.display, 'none', 'child still hidden');

  await click(find('#openChild', parentAttacher));

  assert.equal(childAttacher.style.display, '', 'child shown');

  await click('#closeChild');

  assert.equal(parentAttacher.style.display, '', 'parent still shown');
  assert.equal(childAttacher.style.display, 'none', 'child hidden');
});
