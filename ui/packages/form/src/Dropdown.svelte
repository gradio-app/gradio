<script lang="ts">
    import { onMount } from 'svelte';
    import { fly } from 'svelte/transition';
	import { createEventDispatcher } from "svelte";
	import { BlockTitle } from "@gradio/atoms";
    export let id = '';
    export let readonly = false;
    export let placeholder = '';
	export let label: string;
	export let value: string | Array<string> | undefined = undefined;
	export let multiselect: boolean = false;
	export let choices: Array<string>;
	export let disabled: boolean = false;
	export let show_label: boolean;
  
    let input, 
      inputValue, 
      activeOption, 
      showOptions = false,
      selected = {},
      slot
    const iconClearPath = 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z';
  
    function add(token) {
      if (!readonly) selected[token] = token;
    }
  
    function remove(value) {
      if (!readonly) {
        const {[value]: val, ...rest} = selected;
        selected = rest;
      }
    }
  
    function optionsVisibility(show) {
      if (readonly) return;
      if (typeof show === 'boolean') {
        showOptions = show;
        show && input.focus();
      } else {
        showOptions = !showOptions;
      }
      if (!showOptions) {
        activeOption = undefined;
      }
    }
  
    function handleKeyup(e) {
      if (e.keyCode === 13) {
        Object.keys(selected).includes(activeOption) ? remove(activeOption) : add(activeOption);
        inputValue = '';
      }
      if ([38,40].includes(e.keyCode)) { // up and down arrows
        const increment = e.keyCode === 38 ? -1 : 1;
        const calcIndex = filtered.indexOf(activeOption) + increment;
        activeOption = calcIndex < 0 ? filtered[filtered.length - 1]
          : calcIndex === filtered.length ? filtered[0]
          : filtered[calcIndex];
      }
    }
  
    function handleBlur(e) {
      optionsVisibility(false);
    }
  
    function handleTokenClick(e) {
      if (e.target.closest('.token-remove')) {
        e.stopPropagation();
        remove(e.target.closest('.token').getElementsByTagName('span')[0].textContent);
      } else if (e.target.closest('.remove-all')) {
        selected = [];
        inputValue = '';
      } else {
        optionsVisibility(true);
      }
    }
  
    function handleOptionMousedown(e) {
      const value = e.target.dataset.value;
      if (selected[value]) {
        remove(value);
      } else {
        add(value);
        input.focus();
      }
    }
  </script>

{#if !multiselect}
	<label>
		<BlockTitle {show_label}>{label}</BlockTitle>
		<select
			class="gr-box gr-input w-full disabled:cursor-not-allowed"
			bind:value
			{disabled}
		>
			{#each choices as choice}
				<option>{choice}</option>
			{/each}
		</select>
	</label>
{:else}
  <div class="bg-current border-b-1 border-b-gray-500 relative" class:readonly>
    <div class="items-center flex flex-wrap relative" class:showOptions on:click={handleTokenClick}>
      {#each Object.values(selected) as s}
        <div class="token items-center bg-gray-600 fill-gray-600 rounded-xl flex my-0.5 mr-2 ml-1 max-h-6 py-0.5 px-2 whitespace-nowrap" data-id="{s.value}">
          <span>{s}</span>
          {#if !readonly}
            <div class="token-remove items-center bg-gray-500 rounded-full fill-white flex justify-center ml-0.5 min-w-min" title="Remove {s}">
              <svg class="icon-clear" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                <path d="{iconClearPath}"/>
              </svg>
            </div>
          {/if}
        </div>
      {/each}
      <div class="items-center flex flex-1 min-w-min">
        {#if !readonly}
          <input class="border-none	text-2xl w-full outline-none" id={id} autocomplete="off" bind:value={inputValue} bind:this={input} on:keyup={handleKeyup} on:blur={handleBlur} placeholder={placeholder}/>
          <div class="remove-all items-center bg-gray-500 rounded-full fill-white flex justify-center h-5 ml-1 min-w-min" title="Remove All" class:hidden={!Object.keys(selected).length}>
            <svg class="icon-clear" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
              <path d="{iconClearPath}"/>
            </svg>
          </div>
          <svg class="dropdown-arrow" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><path d="M5 8l4 4 4-4z"></path></svg>
        {/if}
      </div>
    </div>
  
    <select bind:this={slot} type="multiple" class="hidden"><slot></slot></select>
    
    {#if showOptions}
      <ul class="text-neutral-800 shadow ml-0 list-none max-h-16 overflow-auto absolute w-full fill-gray-500" transition:fly="{{duration: 200, y: 5}}" on:mousedown|preventDefault={handleOptionMousedown}>
        {#each choices as choice}
          <li class="bg-gray-100 cursor-pointer p-2 hover:bg-gray-300" class:selected={selected[choice]} class:active={activeOption === choice} data-value="{choice}">{choice}</li>
        {/each}
      </ul>
    {/if}
  </div>
{/if}